import React from 'react'
import {AppRoute} from "./AppRoute"

import {ReviewPage} from "../modules/pages/Teacher/ReviewPage";
import {MainLayout} from "../modules/shared/layout/MainLayout";
import {GroupCreatePage} from "../modules/pages/Teacher/GroupCreatePage";
import {GroupReviewPage} from "../modules/pages/Teacher/GroupReviewPage";


export const useTeacherRoute = () => {
    return (
        <>
            <AppRoute exact path={"/teacher"} component={ReviewPage} layout={MainLayout}/>
            <AppRoute exact path={"/group"} component={GroupCreatePage} layout={MainLayout}/>
            <AppRoute exact path={"/group/:id"} component={GroupReviewPage} layout={MainLayout}/>
        </>
    )
}