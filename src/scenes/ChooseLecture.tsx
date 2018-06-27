import * as React from 'react';
import { List, ListItem, ListItemText } from '@material-ui/core';
import { DataService } from '../helpers/DataService';
import { Lecture } from '../data/Lecture';
import StateService, { AppState } from '../helpers/StateService';

export class ChooseLecture extends React.Component<object, object> {
    render() {
        return (
            <List>
                <ListItem style={{ padding: 4 }} divider />
                {DataService.getLectures().map(lecture => (
                    <ListItem
                        key={lecture.id}
                        onClick={() => this.handleLectureSelection(lecture)}
                        button
                        divider
                    >
                        <ListItemText secondary='Hier könnte ihre Werbung stehen'>{lecture.name}</ListItemText>
                    </ListItem>
                ))}
            </List>
        );
    }

    private handleLectureSelection(lecture: Lecture) {
        DataService.setActiveLecture(lecture);
        StateService.setState(AppState.OVERVIEW_LECTURE);
    }
}