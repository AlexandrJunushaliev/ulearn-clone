import React from 'react'

import {CodeThema} from '../../../components/User/ThemaTypes/CodeThema'
import {ITheme} from '../../../shared/interface'
import {VideoThema} from "../../../components/User/ThemaTypes/VideoThema"
import {TestThema} from '../../../components/User/ThemaTypes/TestThema'

interface Props {
    theme?: any
    nextThema: any
}

export const Theme = (props: Props) => {
    const {theme} = props
    // const {request, loading} = useHttp()
    //
    // let themaType = ''
    // useEffect(() => {
    //     //request to server body api
    // }, [])
    // const data: ITheme = {video: "https://www.youtube.com/watch?v=VnG7ej56lWw", name: ''}
    const data: ITheme = {name: 'name', code: 'const c=(a,b)=>a+b'}
    // const data: ITheme = {
    //     name: 'name',
    //     test: [{
    //         question: '1 вопрос',
    //         answers: [{answerText: '1 ответ', isCorrect: false}, {answerText: "2 ответ", isCorrect: true}],
    //         points: 5
    //     }, {
    //         question: '2 вопрос',
    //         answers: [{answerText: '1 ответ', isCorrect: false}, {answerText: "2 ответ", isCorrect: true}],
    //         points: 5
    //     }]
    // }


    return (
        <div>
            {data.video && <VideoThema url={data.video} name={"video"}/>}
            {data.code && <CodeThema name={data.name} initialCode={data.code}/>}
            {data.test && <TestThema test={data.test}/>}
        </div>
    )
}
