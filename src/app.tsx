import { createMuiTheme, MuiThemeProvider, StyleRulesCallback, Typography, WithStyles, withStyles } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import { Lecture } from './data/Lecture';
import { DataService } from './helpers/DataService';
import EventNames from './helpers/EventNames';
import { initFontAwesome } from './helpers/FontAwesomeInit';
import Language from './helpers/Language';
import { NotificationService } from './helpers/NotificationService';
import StateService, { AppState } from './helpers/StateService';
import { AppDrawer } from './scenes/AppDrawer';
import { AppBarButtonType, AppHeader } from './scenes/AppHeader';
import { ChooseLecture } from './scenes/ChooseLecture';
import { CreateLecture } from './scenes/CreateLecture';
import { LectureOverview } from './scenes/LectureOverview';
import { HotKeys, KeyMap } from 'react-hotkeys';

// const isDevMode = (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));
const APP_BAR_HEIGHT: number = 50;

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
        }
    }
});

type AppClassKey =
    | 'hotkeyDiv'
    | 'content'
    | 'itemIcon';
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
    },
    hotkeyDiv: {
        '&:focus': {
            outline: 0
        }
    },
    itemIcon: {
        width: theme.spacing.unit * 4 + 'px',
        height: theme.spacing.unit * 4 + 'px',
        color: theme.typography.body1.color,
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
    'ctrlTab': 'ctrl+tab'
};

// TODO: Listener für die AppBar, wenn sich die aktive Vorlesung ändert.
//      -> Wird dieser bei der aktuellen Programmstruktur wirklich benötigt?
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

        DataService.init();
        initFontAwesome();

        StateService.registerListener(this.onAppStateChanged);

        ipcRenderer.on(EventNames.M_EV_CREATE_LECTURE, this.createLecture);
    }

    componentDidMount() {
        StateService.setState(AppState.CHOOSE_LECTURE);

        // FIXME: Nur zum Entwickeln - REMOVE ME!
        // if (isDevMode) {
        //     DataService.generateDebugData();
        //     DataService.setActiveLecture(DataService.getLectures()[0]);
        // }
        // StateService.setState(AppState.CHOOSE_LECTURE);
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
                <AppDrawer
                    chooseLecture={this.chooseLecture}
                    createLecture={this.createLecture}
                    editActiveLecture={this.editActiveLecture}
                    toggleDrawer={this.toggleDrawer}
                    open={this.state.isDrawerOpen}
                />

                {/* Main Scene. */}
                <HotKeys
                    keyMap={keyMap}
                    className={this.props.classes.hotkeyDiv}
                >
                    <div
                        className={this.props.classes.content}
                    >
                        {this.state.scene}
                    </div>
                </HotKeys>

                <NotificationService key='NOTI_SYSTEM' theme={theme} />;
            </MuiThemeProvider >
        );
    }

    private createLecture() {
        StateService.setState(AppState.CREATE_LECTURE);
    }

    private chooseLecture() {
        StateService.setState(AppState.CHOOSE_LECTURE);
    }

    private editActiveLecture() {
        StateService.setState(AppState.CREATE_LECTURE, DataService.getActiveLecture());
    }

    private toggleDrawer = (isOpened: boolean) => {
        this.setState({
            isDrawerOpen: isOpened
        });
    }

    private onAppStateChanged(_oldState: AppState, newState: AppState, hasLastState: boolean, lecture: Lecture | undefined) {
        let scene: React.ReactNode = <></>;
        let appBarButtonType: AppBarButtonType = 'back'; // Don't show the menuButton on default.

        let activeLecture = DataService.getActiveLecture();
        let lectureName = activeLecture ? activeLecture.name : Language.getString('NO_LECTURE_CREATED');
        let appBarTitle: string = Language.getAppBarTitle(newState, false, lectureName);

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
                    appBarTitle = Language.getAppBarTitle(newState, true, lectureName);
                }
                break;

            case AppState.CHOOSE_LECTURE:
                scene = <ChooseLecture />;
                break;

            default:
                scene = <Typography variant='display2' >STATE NICHT ZUGEORDNET</Typography>;
                console.error('Zum gegebenen neuen State konnte keine Scene gefunden werden. Neuer State: ' + AppState[newState] + '.');
        }

        this.setState({
            appBarTitle,
            scene,
            appBarButtonType
        });
    }
}

export const App = withStyles(style)<object>(ClassApp);