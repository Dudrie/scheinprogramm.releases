import { createMuiTheme, createStyles, MuiThemeProvider, Typography, WithStyles, withStyles } from '@material-ui/core';
import UpdateEvents from 'common/UpdateEvents';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { HotKeys, KeyMap } from 'react-hotkeys';
import { UpdateNotifications } from './components/UpdateNotifications';
import { Lecture } from './data/Lecture';
import { DataService } from './helpers/DataService';
import { DialogService } from './helpers/DialogService';
import { initFontAwesome } from './helpers/FontAwesomeInit';
import Language from './helpers/Language';
import { NotificationService } from './helpers/NotificationService';
import { SemesterService } from './helpers/SemesterService';
import StateService, { AppState } from './helpers/StateService';
import { AppDrawer } from './view/AppDrawer';
import { AppBarButtonType, AppHeader } from './view/AppHeader';
import { ChooseLecture } from './view/ChooseLecture';
import { CreateLecture } from './view/CreateLecture';
import { LectureOverview } from './view/LectureOverview';

const APP_BAR_HEIGHT: number = 50;
export const CONTENT_PADDING: number = 20;

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#287ee0',
        },
        background: {
            default: '#252525',
        }
    },
    overrides: {
        MuiButton: {
            root: {
                borderRadius: 0
            }
        },
        MuiTooltip: {
            tooltip: {
                fontSize: '0.75em'
            }
        }
    },
    typography: {
        useNextVariants: true
    }
});

const style = () => createStyles({
    '@global': {
        '::-webkit-scrollbar': {
            width: '8px'
        },
        '::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.25)'
        },
        '::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main
        },
        'div[tabindex="-1"]:focus': {
            // This prevents rendering an outline on the divs created by HotKeys.
            outline: 0
        },
        'body': {
            margin: 0,
        },
    },
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflowX: 'hidden'
    },
    appBar: {
        height: APP_BAR_HEIGHT
    },
    content: {
        backgroundColor: theme.palette.background.default,
        marginTop: APP_BAR_HEIGHT + 'px',
        width: '100vw',
        flexGrow: 1,
        height: 'calc(100vh - ' + APP_BAR_HEIGHT + 'px)',
        paddingTop: `${CONTENT_PADDING}px`,
        paddingBottom: '8px',
        paddingLeft: `${CONTENT_PADDING}px`,
        paddingRight: `${CONTENT_PADDING}px`,
        fontFamily: 'Roboto, Consolas',
        userSelect: 'none',
        cursor: 'default',
        color: theme.palette.text.primary,
        boxSizing: 'border-box',
        '& *': {
            boxSizing: 'border-box'
        },
    },
    itemIcon: {
        width: theme.spacing.unit * 4 + 'px',
        height: theme.spacing.unit * 4 + 'px',
        color: theme.typography.body2.color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

interface State {
    isDrawerOpen: boolean;
    isLectureSelectionOpen: boolean;
    scene: React.ReactNode;
    appBarTitle: string;
    appBarButtonType: AppBarButtonType;
}

const keyMap: KeyMap = {
    'ctrlTab': 'ctrl+tab',
    'ctrlO': 'ctrl+o',
    'ctrlS': 'ctrl+s',
    'ctrlN': 'ctrl+n',
    'ctrlD': 'ctrl+d'
};

class AppClass extends React.Component<WithStyles<typeof style>, State> {
    constructor(props: WithStyles<typeof style>) {
        super(props);

        this.state = {
            scene: <></>,
            isDrawerOpen: false,
            isLectureSelectionOpen: false,
            appBarTitle: '',
            appBarButtonType: 'back',
        };

        DataService.init();
        initFontAwesome();
    }

    componentDidMount() {
        StateService.registerListener(this.onAppStateChanged);
        StateService.setState(AppState.CHOOSE_LECTURE);

        setTimeout(() => ipcRenderer.send(UpdateEvents.MAIN_CHECK_FOR_UPDATES, true), 5000);
    }

    componentWillUnmount() {
        StateService.removeListener(this.onAppStateChanged);
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <HotKeys
                    keyMap={keyMap}
                    handlers={{
                        'ctrlS': () => SemesterService.saveSemester(),
                        'ctrlO': () => SemesterService.loadSemester(),
                        'ctrlN': () => SemesterService.createNewSemester(),
                        'ctrlD': () => this.toggleDrawer(!this.state.isDrawerOpen)
                    }}
                    // Make sure, you can use 'global' hotkeys even if 'no' element is focused.
                    attach={window}
                    className={this.props.classes.root}
                >
                    {/* AppBar */}
                    <AppHeader
                        // appBarHeight={APP_BAR_HEIGHT}
                        className={this.props.classes.appBar}
                        appBarTitle={this.state.appBarTitle}
                        buttonType={this.state.appBarButtonType}
                        onMenuClicked={() => this.toggleDrawer(true)}
                        onBackClicked={() => StateService.goBack()}
                    />

                    {/* Drawer */}
                    <AppDrawer
                        toggleDrawer={this.toggleDrawer}
                        open={this.state.isDrawerOpen}
                    />

                    {/* Main Scene. */}
                    <div
                        className={this.props.classes.content}
                    >
                        {this.state.scene}
                    </div>

                    <NotificationService key='NOTI_SYSTEM' theme={theme} />
                    
                    <DialogService />
                    <UpdateNotifications />
                </HotKeys>
            </MuiThemeProvider >
        );
    }

    private toggleDrawer = (isOpened: boolean) => {
        this.setState({
            isDrawerOpen: isOpened
        });
    }

    private onAppStateChanged = (_: AppState, newState: AppState, hasLastState: boolean, lecture: Lecture | undefined) => {
        let scene: React.ReactNode = <></>;
        let appBarButtonType: AppBarButtonType = 'back'; // Don't show the menuButton on default.

        let activeLecture = DataService.getActiveLecture();
        let activeLectureName = activeLecture ? activeLecture.name : Language.getString('NO_LECTURE_CREATED');
        let appBarTitle: string = Language.getAppBarTitle(newState, false, activeLectureName);

        if (!hasLastState) {
            appBarButtonType = 'menu';
        }

        switch (newState) {
            case AppState.OVERVIEW_LECTURE:
                scene = <LectureOverview />;
                appBarButtonType = 'menu';
                break;

            case AppState.CREATE_LECTURE:
                scene = <CreateLecture lectureToEdit={lecture} />;

                // Change the AppBar title if there's a lecture to edit.
                if (lecture) {
                    appBarTitle = Language.getAppBarTitle(newState, true, lecture.name);
                }
                break;

            case AppState.CHOOSE_LECTURE:
                scene = <ChooseLecture />;
                break;

            default:
                scene = <Typography variant='h3' >STATE NICHT ZUGEORDNET</Typography>;
                console.error('Zum gegebenen neuen State konnte keine Scene gefunden werden. Neuer State: ' + AppState[newState] + '.');
        }

        this.setState({
            appBarTitle,
            scene,
            appBarButtonType,
        });
    }
}

export const App = hot(module)(withStyles(style)(AppClass));