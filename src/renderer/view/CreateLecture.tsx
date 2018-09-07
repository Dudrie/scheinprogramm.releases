import * as React from 'react';
import { LectureEditor } from '../components/editors/LectureEditor';
import { Lecture } from '../data/Lecture';
import StateService, { AppState } from '../helpers/StateService';
import { DataService } from '../helpers/DataService';
import { NotificationService } from '../helpers/NotificationService';
import Language from '../helpers/Language';

interface Props {
    lectureToEdit: Lecture | undefined;
}

export class CreateLecture extends React.Component<Props, object> {
    render() {
        return (
            <LectureEditor
                onCreateClicked={this.onLectureCreated}
                onAbortClicked={this.onLectureCreationAbort}
                lectureToEdit={this.props.lectureToEdit}
            />
        );
    }

    /**
     * Called after the user clicked on the create button in the LectureEditor and a lecture was created (not added!). Will add the given lecture to the database.
     * @param lecture Created lecture which will be added
     */
    private onLectureCreated = (lecture: Lecture) => {
        if (this.props.lectureToEdit) {
            this.onLectureEdited(lecture);
            return;
        }

        DataService.addLecture(lecture);

        NotificationService.showNotification({
            title: Language.getString('NOTI_CREACTE_LECTURE_SUCCESS_TITLE'),
            message: Language.getString('NOTI_CREACTE_LECTURE_SUCCESS_MESSAGE', lecture.name),
            level: 'success'
        });

        // StateService.goBack();
        DataService.setActiveLecture(lecture);
        StateService.setState(AppState.OVERVIEW_LECTURE);
    }

    private onLectureEdited = (lecture: Lecture) => {
        DataService.editLecture(lecture);

        NotificationService.showNotification({
            title: Language.getString('NOTI_EDIT_LECTURE_SUCCESS_TITLE'),
            message: Language.getString('NOTI_EDIT_LECTURE_SUCCESS_MESSAGE', lecture.name),
            level: 'success'
        });
        StateService.goBack();
    }

    /**
     * Called after the user clicked the abort button of the LectureEditor. Will go back one scene.
     */
    private onLectureCreationAbort = () => {
        StateService.goBack();
    }
}