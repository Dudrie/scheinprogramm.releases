import { createMuiTheme, Dialog, DialogContent, DialogTitle, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, ListSubheader, MuiThemeProvider, StyleRulesCallback, Typography, WithStyles, withStyles, Grid, DialogActions, Button } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import EventNames from './helpers/EventNames';
import Language from './helpers/Language';
import { NotificationService } from './helpers/NotificationService';
import StateService, { AppState } from './helpers/StateService';
import { AppBarButtonType, AppHeader } from './scenes/AppHeader';
import { CreateLecture } from './scenes/CreateLecture';
import { LectureOverview } from './scenes/LectureOverview';
import { SquareButton } from './components/controls/SquareButton';
import { DataService } from './helpers/DataService';
import { Lecture } from './data/Lecture';

const APP_BAR_HEIGHT: number = 50;

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#2076d8',
        },
        background: {
            default: '#272727'
        }
    }
});

type AppClassKey = 'content';
type PropType = object & WithStyles<AppClassKey>;
const style: StyleRulesCallback<AppClassKey> = () => ({
    content: {
        backgroundColor: theme.palette.background.default,
        marginTop: APP_BAR_HEIGHT + 'px',
        width: '100vw',
        height: 'calc(100vh - ' + APP_BAR_HEIGHT + 'px)',
        paddingTop: '20px',
        paddingBottom: '8px',
        paddingLeft: '20px',
        paddingRight: '20px',
        fontFamily: 'Roboto, Consolas',
        userSelect: 'none',
        cursor: 'default',
        color: theme.palette.text.primary,
        boxSizing: 'border-box',
        '& *': {
            boxSizing: 'border-box'
        }
    }
});

interface State {
    isDrawerOpen: boolean;
    isLectureSelectionOpen: boolean;
    scene: React.ReactNode;
    appBarTitle: string;
    appBarButtonType: AppBarButtonType;
}

class ClassApp extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            scene: <></>,
            isDrawerOpen: false,
            isLectureSelectionOpen: false,
            appBarTitle: '',
            appBarButtonType: 'back'
        };

        this.createLecture = this.createLecture.bind(this);
        this.onAppStateChanged = this.onAppStateChanged.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);

        StateService.registerListener(this.onAppStateChanged);

        ipcRenderer.on(EventNames.M_EV_CREATE_LECTURE, this.createLecture);
    }

    componentDidMount() {
        StateService.setState(AppState.OVERVIEW_LECTURE);

        // FIXME: Nur zum Entwickeln - REMOVE ME!
        // StateService.setState(AppState.CREATE_LECTURE);
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                {/* AppBar */}
                <AppHeader
                    appBarHeight={APP_BAR_HEIGHT}
                    appBarTitle={this.state.appBarTitle}
                    buttonType={this.state.appBarButtonType}
                    onMenuClicked={() => this.toggleDrawer(true)}
                    onBackClicked={() => StateService.goBack()}
                />

                {/* Drawer */}
                <Drawer anchor='left' open={this.state.isDrawerOpen} onClose={() => this.toggleDrawer(false)} >
                    <div
                        role='button'
                        onClick={() => this.toggleDrawer(false)}
                        onKeyDown={() => this.toggleDrawer(false)}
                    >
                        <List>
                            <ListSubheader>
                                {Language.getString('DRAWER_SUBHEADER_LECTURE')}
                            </ListSubheader>
                            <ListItem button onClick={() => this.toggleLectureSelection(true)} >
                                <ListItemIcon style={{ width: '16px', height: '16px' }} >
                                    <i className='fal fa-book' ></i>
                                </ListItemIcon>
                                <ListItemText
                                    primary={Language.getString('DRAWER_CHOOSE_LECTURE_PRIMARY')}
                                    secondary={Language.getString('DRAWER_CHOOSE_LECTURE_SECONDARY')}
                                />
                            </ListItem>
                            <ListItem button onClick={this.createLecture} >
                                <ListItemIcon style={{ width: '16px', height: '16px' }} >
                                    <i className='fas fa-plus' ></i>
                                </ListItemIcon>
                                <ListItemText
                                    primary={Language.getString('DRAWER_CREATE_LECTURE_PRIMARY')}
                                    secondary={Language.getString('DRAWER_CREATE_LECTURE_SECONDARY')}
                                />
                            </ListItem>
                            <ListItem button disabled>
                                <ListItemIcon style={{ width: '16px', height: '16px' }} >
                                    <i className='fal fa-pen' ></i>
                                </ListItemIcon>
                                <ListItemText
                                    primary={Language.getString('DRAWER_EDIT_LECTURE_PRIMARY')}
                                    secondary={Language.getString('DRAWER_EDIT_LECTURE_SECONDARY')}
                                />
                            </ListItem>
                            <Divider />
                        </List>
                    </div>
                </Drawer>

                {/* Lecture Select Dialog */}
                <Dialog
                    open={this.state.isLectureSelectionOpen}
                    onClose={() => this.toggleLectureSelection(false)}
                    fullWidth
                >
                    <DialogContent>
                        <Grid container alignItems='center' >
                            <Grid item xs>
                                <Typography variant='title'>Vorlesungsauswahl</Typography>
                            </Grid>
                            <Grid item>
                                <SquareButton onClick={() => this.toggleLectureSelection(false)} >
                                    <i className='fas fa-times' ></i>
                                </SquareButton>
                            </Grid>
                        </Grid>
                        <List>
                            <ListItem style={{ padding: theme.spacing.unit / 2 }} divider />
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
                    </DialogContent>
                    <DialogActions>
                        <Button color='primary' onClick={() => this.toggleLectureSelection(false)} >
                            {Language.getString('BUTTON_ABORT')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Main Scene. */}
                <div
                    className={this.props.classes.content}
                >
                    {this.state.scene}
                </div>

                <NotificationService key='NOTI_SYSTEM' theme={theme} />;
            </MuiThemeProvider >
        );
    }

    private createLecture() {
        StateService.setState(AppState.CREATE_LECTURE);
    }

    private toggleDrawer(isOpened: boolean) {
        this.setState({
            isDrawerOpen: isOpened
        });
    }

    private toggleLectureSelection(isOpened: boolean) {
        this.setState({
            isLectureSelectionOpen: isOpened
        });
    }

    private handleLectureSelection(lecture: Lecture) {
        // TODO: Tatsächliche Funktionalität implementieren
        this.setState({
            appBarTitle: Language.getAppBarTitle(StateService.getState(), lecture.name)
        });

        this.toggleLectureSelection(false);
    }

    private onAppStateChanged(_oldState: AppState, newState: AppState) {
        let scene: React.ReactNode = <></>;
        let appBarButtonType: AppBarButtonType = 'back'; // Don't show the menuButton on default.

        switch (newState) {
            case AppState.OVERVIEW_LECTURE:
                scene = <LectureOverview />;
                appBarButtonType = 'menu';
                break;

            case AppState.CREATE_LECTURE:
                scene = <CreateLecture />;
                break;

            default:
                scene = <Typography variant='display2' >STATE NICHT ZUGEORDNET</Typography>;
                console.error('Zum gegebenen neuen State konnte keine Scene gefunden werden. Neuer State: ' + AppState[newState] + '.');
        }

        this.setState({
            // TODO: Tatsächlichen Vorlesungsnamen benutzen.
            appBarTitle: Language.getAppBarTitle(newState, 'DUMMY_VORLESUNGSNAME'),
            scene,
            appBarButtonType
        });
    }
}

export const App = withStyles(style)<object>(ClassApp);