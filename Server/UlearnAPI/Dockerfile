FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build

# My copy 
WORKDIR /src
COPY *.sln .
COPY UlearnAPI/*.csproj UlearnAPI/
COPY UlearnData/*.csproj UlearnData/
COPY UlearnServices/*.csproj UlearnServices/
RUN dotnet restore

COPY . ./
FROM build AS publish
WORKDIR /src/UlearnAPI

# dotnet ef tool
RUN dotnet tool update --global dotnet-ef --version 3.0.0-preview7.19362.6
RUN dotnet tool restore
ENV PATH="${PATH}:/root/.dotnet/tools"

RUN dotnet publish -c Release -o /src/publish

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS runtime
WORKDIR /app
COPY --from=publish /src/publish .
# ENTRYPOINT ["dotnet", "UlearnAPI.dll"]
# heroku uses the following
CMD ASPNETCORE_URLS=http://*:$PORT dotnet UlearnAPI.dll