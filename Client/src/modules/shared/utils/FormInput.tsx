import React from 'react'

interface Props {
    onChange: (event: any) => void
    name: string
    formValue: any
    type?: string
}

export const FormInput = (props: Props) => {

    const {onChange, name, formValue, type = "text"} = props
    const label = name.charAt(0).toUpperCase() + name.slice(1)
    const htmlFor = `${name}-${Math.random()}`
    return (
        <div className="form-group">
            <label htmlFor={htmlFor}>{label}</label>
            <input
                required
                id={htmlFor}
                onChange={onChange}
                value={formValue}
                name={name}
                placeholder={name}
                className="form-control item"
                type={type}/>
        </div>
    )
}