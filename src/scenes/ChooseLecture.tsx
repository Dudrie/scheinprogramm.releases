import { List, ListItem, ListItemIcon, ListItemText, Typography, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import * as React from 'react';
import { Lecture } from '../data/Lecture';
import { DataService } from '../helpers/DataService';
import StateService, { AppState } from '../helpers/StateService';
import Language from '../helpers/Language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DeleteButton } from '../components/controls/DeleteButton';

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
                        <FontAwesomeIcon icon={{ prefix: 'fas', iconName: 'plus' }} />
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
                            <FontAwesomeIcon icon={{ prefix: 'fas', iconName: 'book-open' }} />
                        </ListItemIcon>
                        <ListItemText secondary='Hier könnte ihre Werbung stehen'>{lecture.name}</ListItemText>
                        <ListItemSecondaryAction style={{marginRight: '16px'}} >
                            <DeleteButton
                                tooltipElement={Language.getString('LECTURE_CONFIRM_DELETE')}
                                // variant='outlined'
                            >
                                <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'trash-alt' }} />
                            </DeleteButton>
                        </ListItemSecondaryAction>
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