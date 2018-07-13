import * as React from 'react';
import { WithStyles, StyleRulesCallback, Theme, List, ListSubheader, ListItem, ListItemText, Divider, withStyles } from '../../node_modules/@material-ui/core';
import Drawer, { DrawerProps } from '../../node_modules/@material-ui/core/Drawer';
import Language from '../helpers/Language';
import { FontAwesomeIcon } from '../../node_modules/@fortawesome/react-fontawesome';
import { DataService } from '../helpers/DataService';

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
                                primary={Language.getString('DRAWER_CHOOSE_LECTURE_PRIMARY')}
                                secondary={Language.getString('DRAWER_CHOOSE_LECTURE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem button onClick={createLecture} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'far', iconName: 'plus' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_CREATE_LECTURE_PRIMARY')}
                                secondary={Language.getString('DRAWER_CREATE_LECTURE_SECONDARY')}
                            />
                        </ListItem>
                        <ListItem button disabled={DataService.getActiveLecture() === undefined} onClick={editActiveLecture} >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'pen' }} />
                            </div>
                            <ListItemText
                                primary={Language.getString('DRAWER_EDIT_LECTURE_PRIMARY')}
                                secondary={Language.getString('DRAWER_EDIT_LECTURE_SECONDARY')}
                            />
                        </ListItem>
                        <Divider />
                        {/* TODO: Semester-Interaktionen implementieren */}
                        <ListSubheader>
                            Semester
                            </ListSubheader>
                        <ListItem button disabled >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'file-alt' }} />
                            </div>
                            <ListItemText
                                primary='Semester anlegen'
                                secondary='BLA BLA BLA'
                            />
                        </ListItem>
                        <ListItem button disabled >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'save' }} />
                            </div>
                            <ListItemText
                                primary='Semester speichern'
                                secondary='BLA BLA BLA'
                            />
                        </ListItem>
                        <ListItem button disabled >
                            <div className={this.props.classes.itemIcon} >
                                <FontAwesomeIcon size='lg' icon={{ prefix: 'fal', iconName: 'folder' }} />
                            </div>
                            <ListItemText
                                primary='Semester laden'
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