using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using UlearnAPI.Chat;
using UlearnAPI.Middleware;
using UlearnData;
using UlearnData.Models;
using UlearnServices.Services;
using UlearnServices.Services.CodeTasks;
using UlearnServices.Services.TestTasks;
using UlearnServices.Services.VideoTasks;

namespace UlearnAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();

            var builder = new PostgreSqlConnectionStringBuilder("postgres://pxerakwflnwiag:f97210215541b736da9c83c6637c91ea6ffb9c4ede18865aaeb2a73f23ac3caf@ec2-18-214-211-47.compute-1.amazonaws.com:5432/dfnqs9una17hh0")
            {
                Pooling = true,
                TrustServerCertificate = true,
                SslMode = SslMode.Require
            };
            services.AddEntityFrameworkNpgsql().AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.ConnectionString,
                    b => b.MigrationsAssembly("UlearnAPI")));
/*
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(Configuration.GetConnectionString("SqliteLocal"),
                    b => b.MigrationsAssembly("UlearnAPI")));
*/
            services.AddIdentity<User, IdentityRole>(options => { options.User.RequireUniqueEmail = true; })
                .AddRoles<IdentityRole>()
                .AddRoleManager<RoleManager<IdentityRole>>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddGoogle(options =>
                {
                    IConfigurationSection googleAuthNSection =
                        Configuration.GetSection("Authentication:Google");
                    //FIXME: change secrets in appsettings.json
                    options.ClientId = googleAuthNSection["ClientId"];
                    options.ClientSecret = googleAuthNSection["ClientSecret"];
                })
                .AddJwtBearer(x =>
                {
                    x.RequireHttpsMetadata = false;
                    x.SaveToken = true;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        RoleClaimType = "role",
                        NameClaimType = "name",
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidAudience = Configuration["Jwt:Issuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Configuration["Jwt:Key"])),
                        ClockSkew = TimeSpan.Zero
                    };
                });

            // requires using Microsoft.Extensions.Options
            services.Configure<UlearnDatabaseSettings>(
                Configuration.GetSection(nameof(UlearnDatabaseSettings)));

            services.AddSingleton<IUlearnDatabaseSettings>(sp =>
                sp.GetRequiredService<IOptions<UlearnDatabaseSettings>>().Value);

            services.AddAuthorization();
            services.AddControllers();
            services.AddSwaggerDocument();

            services.AddMemoryCache();
            services.AddResponseCompression();

            services.AddScoped<SubscriptionsService>();
            services.AddScoped<ModulesService>();
            services.AddScoped<TestTasksService>();
            services.AddScoped<CoursesService>();
            services.AddScoped<GroupsService>();
            services.AddScoped<CodeTasksService>();
            services.AddScoped<VideoTasksService>();
            services.AddScoped<AccountService>();
            services.AddScoped<LoggingService>();
            services.AddScoped<CodeTaskResultService>();
            services.AddScoped<VideoTaskResultService>();
            services.AddScoped<TestTaskResultService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //тут монга
            app.UseMiddleware<MongoLogMiddleware>();

            JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

            if (env.IsDevelopment())
            {
                app.UseCors(builder => builder.WithOrigins("http://localhost:3000").AllowCredentials().AllowAnyMethod()
                    .AllowAnyHeader());
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseResponseCompression();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseHttpsRedirection();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute("DefaultRoute", "api/{controller}/{action}/{id?}");
                endpoints.MapHub<ChatHub>("/api/chat");
            });

            app.UseOpenApi();
            app.UseSwaggerUi3();

            using var scope = app.ApplicationServices.CreateScope();
            CreateRoles(scope.ServiceProvider.GetService<IServiceProvider>()).Wait();
        }

        private async Task CreateRoles(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            string[] roleNames = {"Admin", "Teacher"};

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            User user = await userManager.FindByEmailAsync("admin@mail.ru");

            if (user == null)
            {
                var admin = new User()
                {
                    UserName = "Admin",
                    Email = "admin@mail.ru",
                };
                var createPowerUser = await userManager.CreateAsync(admin, "Admin123!");
                if (createPowerUser.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
        }
    }
}