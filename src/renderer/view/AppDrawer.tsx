import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createStyles, Divider, Drawer, List, ListItem, ListItemText, ListSubheader, Theme, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import * as path from 'path';
import { DataService } from '../helpers/DataService';
import Language from '../helpers/Language';
import { SemesterService } from '../helpers/SemesterService';
import StateService, { AppState } from '../helpers/StateService';
import { DialogService } from '../helpers/DialogService';
import { ConfigStoreService } from 'common/ConfigStoreService';

const style = (theme: Theme) => createStyles({
    itemIcon: {
        width: theme.spacing.unit * 4 + 'px',
        height: theme.spacing.unit * 4 + 'px',
        color: theme.typography.body2.color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

interface Props extends WithStyles<typeof style> {
    toggleDrawer: (open: boolean) => void;
    open: boolean;
}

class AppDrawerClass extends React.Component<Props, object> {
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
                            disabled={DataService.getLectures().length == 0}
                            onClick={this.onSaveSemesterAsNewFileClicked}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'save' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_SAVE_AS_NEW_FILE_PRIMARY')}
                                secondary={Language.getString('DRAWER_SEMESTER_SAVE_AS_NEW_FILE_SECONDARY')}
                            />
                        </ListItem>

                        <ListItem
                            button
                            onClick={this.onLoadRecentSemesterClicked}
                            disabled={!ConfigStoreService.has('recentFile')}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'folder-open' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_RECENTLY_OPENED_PRIMARY')}
                                secondary={this.getRecentLoadedFileName()}
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
                            onClick={this.onAboutClicked}
                        >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'info' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_INFO_PRIMARY')}
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

    private onCreateSemesterClicked = (_event: React.MouseEvent<HTMLElement>) => {
        SemesterService.createNewSemester();
    }

    private onSaveSemesterClicked = () => {
        SemesterService.saveCurrentlyOpenedSemester();
    }

    private onSaveSemesterAsNewFileClicked = () => {
        SemesterService.saveSemesterAsNewFile();
    }

    private onLoadSemesterClicked = () => {
        SemesterService.loadSemester();
    }

    private onLoadRecentSemesterClicked = () => {
        SemesterService.loadRecentSemester();
    }

    private onAboutClicked() {
        DialogService.showInfoDialog();
    }

    private getRecentLoadedFileName(): string {
        let filePath: string | undefined = SemesterService.getRecentSemesterFileLocation();

        if (!filePath) {
            return Language.getString('DRAWER_SEMESTER_RECENTLY_OPENED_NO_RECENT_FILE_SECONDARY');
        }

        let parsed: path.ParsedPath = path.parse(filePath);
        return `${parsed.name}${parsed.ext}`;
    }
}

export const AppDrawer = withStyles(style)(AppDrawerClass);