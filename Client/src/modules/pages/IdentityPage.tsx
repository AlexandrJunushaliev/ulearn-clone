import React, {useContext} from 'react'
import {Link} from "react-router-dom"
import jwt from "jsonwebtoken"
import {IdentityForm} from "../components/identity/IdentityForm"
import {IdentityPicture} from "../components/identity/IdentityPicture"
import {AuthContext} from "../context/AuthContext"
import {useHttp} from "../hooks/http.hook"
import {accountRequest, fileDownloadRequest, groupGetRequest, groupRequest, teacherConfirm} from "../shared/request"
import {useFetch} from "../hooks/fetch.hook"
import {GoogleMap} from "../shared/utils/GoogleMap"
import {Token} from "../shared/interface"


interface settings {
    name: string
    value: Array<string>
}


export const IdentityPage = () => {
    const auth = useContext(AuthContext)
    const {request, loading, error} = useHttp()


    const settings: Array<settings> = [
        {name: "Profile settings", value: ["username", "email", "lastname", "firstname"]},
        {name: "Password settings", value: ["current", "password", "repeat Password"]}
    ]

    const {fetched: fetchedIdentity, isBusy} = useFetch<any>(accountRequest)

    const {fetched} = useFetch<any>(groupGetRequest)

    const teachersGroup = () => {
        return fetched && fetched.map((g: any) => (
            <Link to={`/group/${g.id}`} key={`${g.name}-${g.courseId}`} className="module p-3 border">
                <p className="text-primary m-0 font-weight-bold text-lg-left ">{g.name}</p>
                <span className="text-primary">{g.course}</span>
            </Link>
        ))
    }

    const submitData = async (event: any, form: any) => {
        event.preventDefault()
        if (form.password) {
            await request(`${accountRequest}/changePassword`, 'POST', {
                password: form.password,
                current: form.current
            })
        } else {
            await request(`${accountRequest}/updateData`, 'PUT', {...form})
        }
    }

    const confirmTeacherAccount = async () => {
        const token: any = await request(teacherConfirm, "POST")
        if (token && token.token) {
            const decoded = jwt.decode(token.token as string)
            const tokenItems = decoded as Token
            auth.login(token.token, tokenItems.sub, tokenItems.role)
        }
    }

    const settingsCreate = () => {
        let flag = ''
        let props = {}
        return settings.map(({value, name}, index) => {
            if (index === 1) {
                flag = 'mb-3'
            } else {
                props = {
                    initialValues: {...fetchedIdentity}
                }
            }
            return (
                <div className={`card shadow ${flag}`} key={`${name}-${index}`}>
                    <div className="card-header py-3">
                        <p className="text-primary m-0 font-weight-bold">{name}</p>
                    </div>
                    <IdentityForm {...props} loading={loading} error={error} submit={submitData} formNames={value}/>
                </div>
            )
        })
    }

    return (
        <main className="page">
            <div className="container">
                <h3 className="text-dark mb-4">Profile</h3>
                <div className="row mb-3">
                    <div className="col-lg-4">
                        <div className="card mb-3">
                            {!isBusy && <IdentityPicture initialValue={`${fileDownloadRequest}?filename=${fetchedIdentity.imageSrc}`}/>}
                        </div>
                        <div>
                            <div className="card mb-3">
                                <div className="card-body text-center shadow justify-content-between">
                                    {auth.role === 'Teacher' || auth.role === 'Admin' ? teachersGroup() :
                                        <button disabled={loading} className="btn btn-info"
                                                onClick={confirmTeacherAccount}>Confirm
                                            teacher account</button>}
                                    <GoogleMap/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="row">
                            <div className="col">
                                {error && <span className="alert-warning">{error}</span>}
                                {!isBusy && settingsCreate()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
