import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import * as React from 'react';
import { Lecture } from '../data/Lecture';
import { DataService } from '../helpers/DataService';
import StateService, { AppState } from '../helpers/StateService';
import Language from '../helpers/Language';

export class ChooseLecture extends React.Component<object, object> {
    render() {
        let lectures = DataService.getLectures();
        return (
            <List>
                <ListItem
                    onClick={() => StateService.setState(AppState.CREATE_LECTURE)}
                    button
                    divider
                >
                    <ListItemIcon>
                        <i className='fas fa-plus' ></i>
                    </ListItemIcon>
                    <ListItemText secondary={Language.getString('CHOOSE_LECTURE_NEW_LECTURES_SECONDARY')} >
                        {Language.getString('CHOOSE_LECTURE_NEW_LECTURES_PRIMARY')}
                    </ListItemText>
                </ListItem>

                {lectures.map(lecture => (
                    <ListItem
                        key={lecture.id}
                        onClick={() => this.handleLectureSelection(lecture)}
                        button
                        divider
                    >
                        <ListItemIcon>
                            <i className='fas fa-book-open' ></i>
                        </ListItemIcon>
                        <ListItemText secondary='Hier könnte ihre Werbung stehen'>{lecture.name}</ListItemText>
                    </ListItem>
                ))}

                {lectures.length == 0 && <ListItem style={{ justifyContent: 'center', paddingTop: '24px' }} >
                    <Typography variant='title'>
                        {Language.getString('CHOOSE_LECTURE_NO_LECTURES')}
                    </Typography>
                </ListItem>}
            </List>
        );
    }

    private handleLectureSelection(lecture: Lecture) {
        DataService.setActiveLecture(lecture);
        StateService.setState(AppState.OVERVIEW_LECTURE);
    }
}