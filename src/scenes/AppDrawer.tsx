import * as React from 'react';
import { FontAwesomeIcon } from '../../node_modules/@fortawesome/react-fontawesome';
import { Divider, List, ListItem, ListItemText, ListSubheader, StyleRulesCallback, Theme, WithStyles, withStyles } from '../../node_modules/@material-ui/core';
import Drawer from '../../node_modules/@material-ui/core/Drawer';
import { DataService } from '../helpers/DataService';
import Language from '../helpers/Language';
import StateService, { AppState } from '../helpers/StateService';
import { SaveDialogOptions, remote, OpenDialogOptions } from 'electron';
import * as fs from 'fs';
import { NotificationService } from '../helpers/NotificationService';

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
                        <ListSubheader>
                            {Language.getString('DRAWER_SUBHEADER_LECTURE')}
                        </ListSubheader>
                        <ListItem button onClick={this.onChooseLectureClicked} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'book' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_CHOOSE_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_CHOOSE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem button onClick={this.onCreateLectureClicked} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'far', iconName: 'plus' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_CREATE_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_CREATE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem button disabled={DataService.getActiveLecture() === undefined} onClick={this.onEditActiveLectureClicked} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'pen' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_EDIT_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_EDIT_SECONDARY')}
                            />
                        </ListItem>
                        <Divider />
                        <ListSubheader>
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
                        <ListItem button onClick={this.onSaveSemesterClicked} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'save' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_SAVE_PRIMARY')}
                                secondary={Language.getString('DRAWER_SEMESTER_SAVE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem button onClick={this.onLoadSemesterClicked} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'folder' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_LOAD_PRIMARY')}
                                secondary={Language.getString('DRAWER_SEMESTER_LOAD_SECONDARY')}
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
        let options: SaveDialogOptions = {
            title: Language.getString('DIALOG_SAVE_SEMESTER_TITLE'),
            filters: [
                { name: Language.getString('DIALOG_SEMESTER_FILE_TYPE_NAME'), extensions: ['json'] }
            ]
        };

        remote.dialog.showSaveDialog(
            remote.getCurrentWindow(),
            options,
            (filename) => this.saveSemesterToFile(filename)
        );
    }

    private onLoadSemesterClicked = () => {
        let options: OpenDialogOptions = {
            title: Language.getString('DIALOG_LOAD_SEMESTER_TITLE'),
            filters: [
                { name: Language.getString('DIALOG_SEMESTER_FILE_TYPE_NAME'), extensions: ['json'] }
            ]
        };

        // The dialog returns an array but the user still can only select ONE file.
        remote.dialog.showOpenDialog(
            remote.getCurrentWindow(),
            options,
            (files) => this.loadSemesterFromFile(files)
        );
    }

    /**
     * Saves the current semester in the given file. If no file is provided the method will abort.
     *
     * @param filename Path to the file.
     */
    private saveSemesterToFile(filename: string) {
        if (!filename) {
            return;
        }

        fs.writeFile(
            filename,
            DataService.getDataAsJson(),
            { encoding: 'utf8' },
            (err) => {
                if (err) {
                    console.error('[ERROR] Semester could not be saved to the file \"' + filename + '\".\n' + err);
                    NotificationService.showNotification({
                        title: Language.getString('NOTI_SEMESTER_SAVE_ERROR_TITLE'),
                        message: Language.getString('NOTI_SEMESTER_SAVE_ERROR_MESSAGE'),
                        level: 'error',
                        autoDismiss: 10
                    });
                    return;
                }

                NotificationService.showNotification({
                    title: Language.getString('NOTI_SEMESTER_SAVE_SUCCESS_TITLE'),
                    message: Language.getString('NOTI_SEMESTER_SAVE_SUCCESS_MESSAGE'),
                    level: 'success'
                });
            }
        );
    }

    /**
     * Loads the semester in the array. Takes only the first file into account. If there's no array or if it's empty the method will abort.
     *
     * @param files Array containing the path to the file, which should be read, at index 0.
     */
    private loadSemesterFromFile(files: string[]) {
        if (!files || files.length == 0) {
            return;
        }

        let filename: string = files[0];
        let json: string;

        // Read the content of the file if possible.
        try {
            json = fs.readFileSync(filename, { encoding: 'utf8' });

        } catch (err) {
            console.error('[ERROR] File could not be read \"' + filename + '\".');
            NotificationService.showNotification({
                title: Language.getString('NOTI_SEMESTER_LOAD_ERROR_TITLE'),
                message: Language.getString('NOTI_SEMESTER_LOAD_ERROR_ACCESS_FILE_MESSAGE'),
                level: 'error',
                autoDismiss: 10
            });
            return;
        }

        if (DataService.loadDataFromJson(json)) {
            NotificationService.showNotification({
                title: Language.getString('NOTI_SEMESTER_LOAD_SUCCESS_TITLE'),
                message: Language.getString('NOTI_SEMESTER_LOAD_SUCCESS_MESSAGE'),
                level: 'success'
            });

            // Set the new state and prevent the user from going back.
            StateService.setState(AppState.CHOOSE_LECTURE, undefined, false);
            StateService.preventGoingBack();
            
        } else {
            NotificationService.showNotification({
                title: Language.getString('NOTI_SEMESTER_LOAD_ERROR_TITLE'),
                message: Language.getString('NOTI_SEMESTER_LOAD_ERROR_NOT_VALID_JSON_MESSAGE'),
                level: 'error',
                autoDismiss: 10
            });
        }
    }
}

export const AppDrawer = withStyles(style)<Props>(AppDrawerClass
);