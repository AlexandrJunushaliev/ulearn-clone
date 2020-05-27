import React from 'react'
import {ISubscription} from "../../shared/interface"
import {Loader} from "../../shared/utils/Loader"


interface Props {
    onClick: (id: number) => void
    onDelete?: (id: number) => void
    text: string
    subscription?: ISubscription[]
    loading: boolean
}


export const SubscriptionView = (props: Props) => {
    const {
        onClick, text, subscription = [{
            price: 12,
            name: "321321",
            level: 321321,
            id: 0
        }], loading, onDelete
    } = props

    if (loading) {
    }

    const subscriptionHandler = () => {

        return subscription.map((sub: any) => (
            <div className="col-md-5 col-lg-4" key={`${sub.name}-${sub.price}`}>
                <div className="clean-pricing-item">
                    <div className="heading">
                        <h3>{sub.name}</h3>
                    </div>
                    <p><span>Уровень </span>{sub.level}</p>
                    <div className="price">
                        <h4><small>Цена </small>{sub.price}</h4>
                    </div>
                    <button onClick={() => onClick(sub.id!)}
                            className="btn btn-outline-primary btn-block"
                            type="button">{text}</button>
                    {onDelete && <button onClick={() => onDelete(sub.id!)}
                                         className="btn btn-outline-primary btn-block"
                                         type="button">Delete</button>}
                </div>
            </div>
        ))

    }


    return (
        <>
            {subscriptionHandler()}
        </>
    )
}
