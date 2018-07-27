import * as React from 'react';
import { FontAwesomeIcon } from '../../node_modules/@fortawesome/react-fontawesome';
import { Divider, List, ListItem, ListItemText, ListSubheader, StyleRulesCallback, Theme, WithStyles, withStyles } from '../../node_modules/@material-ui/core';
import Drawer from '../../node_modules/@material-ui/core/Drawer';
import { DataService } from '../helpers/DataService';
import Language from '../helpers/Language';
import { NotificationService } from '../helpers/NotificationService';
import { SaveLoadService } from '../helpers/SaveLoadService';
import StateService, { AppState } from '../helpers/StateService';

interface Props {
    toggleDrawer: (open: boolean) => void;
    open: boolean;
}

type AppDrawerClassKey = 'itemIcon';
type PropType = Props & WithStyles<AppDrawerClassKey>;

const style: StyleRulesCallback<AppDrawerClassKey> = (theme: Theme) => ({
    itemIcon: {
        width: theme.spacing.unit * 4 + 'px',
        height: theme.spacing.unit * 4 + 'px',
        color: theme.typography.body1.color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

// TODO: Speichern & Laden einbauen.
class AppDrawerClass extends React.Component<PropType, object> {
    render() {
        let { toggleDrawer, open } = this.props;

        return (
            <Drawer open={open} anchor='left' onClose={() => toggleDrawer(false)} >
                {/* This div gets the click event of the buttons in it. It's used, so not every ListItem has to handle the drawer-closing. */}
                <div
                    role='button'
                    onClick={() => toggleDrawer(false)}
                    onKeyDown={() => toggleDrawer(false)}
                >
                    <List>
                        <ListSubheader disableSticky >
                            {Language.getString('DRAWER_SUBHEADER_LECTURE')}
                        </ListSubheader>
                        <ListItem
                            button
                            onClick={this.onChooseLectureClicked}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'book' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_CHOOSE_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_CHOOSE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem
                            button
                            onClick={this.onCreateLectureClicked}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'far', iconName: 'plus' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_CREATE_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_CREATE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem
                            button
                            disabled={DataService.getActiveLecture() === undefined}
                            onClick={this.onEditActiveLectureClicked}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'pen' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_EDIT_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_EDIT_SECONDARY')}
                            />
                        </ListItem>
                        <Divider />
                        <ListSubheader disableSticky >
                            {Language.getString('DRAWER_SUBHEADER_SEMESTER')}
                        </ListSubheader>
                        <ListItem button onClick={this.onCreateSemesterClicked} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'file-alt' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_CREATE_PRIMARY')}
                                secondary={Language.getString('DRAWER_SEMESTER_CREATE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem
                            button
                            disabled={DataService.getLectures().length == 0}
                            onClick={this.onSaveSemesterClicked}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'save' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_SAVE_PRIMARY')}
                                secondary={Language.getString('DRAWER_SEMESTER_SAVE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem
                            button
                            onClick={this.onLoadSemesterClicked}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'folder' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_LOAD_PRIMARY')}
                                secondary={Language.getString('DRAWER_SEMESTER_LOAD_SECONDARY')}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem
                            button
                            disabled
                            // TODO: Implementieren
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'info' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_INFO_ABOUT_PRIMARY')}
                            />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        );
    }

    private onCreateLectureClicked() {
        StateService.setState(AppState.CREATE_LECTURE);
    }

    private onChooseLectureClicked() {
        StateService.setState(AppState.CHOOSE_LECTURE);
    }

    private onEditActiveLectureClicked() {
        StateService.setState(AppState.CREATE_LECTURE, DataService.getActiveLecture());
    }

    private onCreateSemesterClicked = () => {
        // TODO: Confirm-Dialog anzeigen.

        DataService.clearData();

        NotificationService.showNotification({
            title: Language.getString('NOTI_SEMESTER_CREATE_SUCCESS_TITLE'),
            message: Language.getString('NOTI_SEMESTER_CREATE_SUCCESS_MESSAGE'),
            level: 'success'
        });

        StateService.setState(AppState.CHOOSE_LECTURE, undefined, false);
        StateService.preventGoingBack();
    }

    private onSaveSemesterClicked = () => {
        SaveLoadService.saveSemester();
    }

    private onLoadSemesterClicked = () => {
        SaveLoadService.loadSemester();
    }

}

export const AppDrawer = withStyles(style)<Props>(AppDrawerClass
);