import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Slide, Typography, Theme, StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { Lecture } from '../data/Lecture';
import { DataService } from '../helpers/DataService';
import Language from '../helpers/Language';
import { NotificationService } from '../helpers/NotificationService';
import StateService, { AppState } from '../helpers/StateService';

type ChooseLectureClassKey = 'lectureList';
const style: StyleRulesCallback<ChooseLectureClassKey> = (_: Theme) => ({
    lectureList: {
        paddingTop: 0
    }
});

interface State {
    dialog: JSX.Element | undefined;
}

type PropType = object & WithStyles<ChooseLectureClassKey>;

class ChooseLectureClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            dialog: undefined
        };
    }
    render() {
        let lectures = DataService.getLectures();
        return (<>
            {this.state.dialog}
            <List className={this.props.classes.lectureList} >
                <ListItem
                    onClick={() => StateService.setState(AppState.CREATE_LECTURE)}
                    button
                    divider
                >
                    <FontAwesomeIcon size='lg' icon={{ prefix: 'far', iconName: 'plus' }} />
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
                        <FontAwesomeIcon size='lg' icon={{ prefix: 'far', iconName: 'book-open' }} />
                        {/* TODO: Secondary durch etwas sinnvolles ersetzen. */}
                        <ListItemText secondary='Hier könnte ihre Werbung stehen'>{lecture.name}</ListItemText>

                        <ListItemSecondaryAction style={{ marginRight: '16px' }} >
                            <IconButton onClick={() => this.onLectureEditClicked(lecture)} >
                                <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'pencil' }} />
                            </IconButton>
                            <IconButton onClick={() => this.onLectureDeleteClicked(lecture)} >
                                <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'trash-alt' }} />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}

                {lectures.length == 0 && <ListItem style={{ justifyContent: 'center', paddingTop: '24px' }} >
                    <Typography variant='title'>
                        {Language.getString('CHOOSE_LECTURE_NO_LECTURES')}
                    </Typography>
                </ListItem>}
            </List>
        </>);
    }

    private handleLectureSelection(lecture: Lecture) {
        DataService.setActiveLecture(lecture);
        StateService.setState(AppState.OVERVIEW_LECTURE);
    }

    private onLectureEditClicked = (lecture: Lecture) => {
        StateService.setState(AppState.CREATE_LECTURE, lecture);
    }

    private onLectureDeleteClicked = (lecture: Lecture) => {
        let dialog: JSX.Element = (
            <Dialog
                open
                TransitionComponent={(props) => <Slide direction='down' timeout={100} unmountOnExit {...props} />}
            >
                <DialogTitle>{Language.getString('DIALOG_DELETE_LECTURE_TITLE')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {Language.getString('DIALOG_DELETE_LECTURE_MESSAGE', lecture.name)}
                        {/* Soll die Vorlesung "{lecture.name}" wirklich gelöscht werden? Dies kann nicht rückgängig gemacht werden. */}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({ dialog: undefined })} >
                        {Language.getString('BUTTON_ABORT')}
                    </Button>
                    <Button onClick={() => this.deleteLecture(lecture)} color='secondary' >
                        {Language.getString('BUTTON_DELETE')}
                    </Button>
                </DialogActions>
            </Dialog>
        );

        this.setState({ dialog });
    }

    private deleteLecture(lecture: Lecture) {
        DataService.deleteLecture(lecture.id);

        if (DataService.getActiveLecture() === undefined) {
            // The deleted lecture was the active one and got removed.
            StateService.preventGoingBack();
        }

        NotificationService.showNotification({
            title: Language.getString('NOTI_LECTURE_DELETED_TITLE'),
            message: Language.getString('NOTI_LECTURE_DELETED_MESSAGE', lecture.name),
            level: 'success'
        });

        this.setState({
            dialog: undefined
        });
    }
}

export const ChooseLecture = withStyles(style)<object>(ChooseLectureClass);