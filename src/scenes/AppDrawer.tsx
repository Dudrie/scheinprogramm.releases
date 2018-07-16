import * as React from 'react';
import { FontAwesomeIcon } from '../../node_modules/@fortawesome/react-fontawesome';
import { Divider, List, ListItem, ListItemText, ListSubheader, StyleRulesCallback, Theme, WithStyles, withStyles } from '../../node_modules/@material-ui/core';
import Drawer from '../../node_modules/@material-ui/core/Drawer';
import { DataService } from '../helpers/DataService';
import Language from '../helpers/Language';

interface Props {
    chooseLecture: () => void;
    createLecture: () => void;
    editActiveLecture: () => void;
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

class AppDrawerClass extends React.Component<PropType, object> {
    render() {
        let { chooseLecture, editActiveLecture, createLecture, toggleDrawer, open } = this.props;

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
                        <ListItem button onClick={chooseLecture} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'book' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_CHOOSE_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_CHOOSE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem button onClick={createLecture} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'far', iconName: 'plus' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_CREATE_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_CREATE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem button disabled={DataService.getActiveLecture() === undefined} onClick={editActiveLecture} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'pen' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_LECTURE_EDIT_PRIMARY')}
                                secondary={Language.getString('DRAWER_LECTURE_EDIT_SECONDARY')}
                            />
                        </ListItem>
                        <Divider />
                        {/* TODO: Semester-Interaktionen implementieren */}
                        <ListSubheader>
                        {Language.getString('DRAWER_SUBHEADER_SEMESTER')}
                        </ListSubheader>
                        <ListItem button disabled >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'file-alt' }} />
                            </div>
                            <ListItemText
                                // primary='Semester anlegen'
                                primary={Language.getString('DRAWER_SEMESTER_CREATE_PRIMARY')}
                                secondary='BLA BLA BLA'
                            />
                        </ListItem>
                        <ListItem button disabled >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'save' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_SAVE_PRIMARY')}
                                // primary='Semester speichern'
                                secondary='BLA BLA BLA'
                            />
                        </ListItem>
                        <ListItem button disabled >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'folder' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_SEMESTER_LOAD_PRIMARY')}
                                // primary='Semester laden'
                                secondary='BLA BLA BLA'
                            />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        );
    }
}

export const AppDrawer = withStyles(style)<Props>(AppDrawerClass
);