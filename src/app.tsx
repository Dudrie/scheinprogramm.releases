import { AppBar, Divider, Drawer, Grid, List, ListItem, ListItemIcon, ListItemText, ListSubheader, MuiThemeProvider, Toolbar, Typography, WithStyles, createMuiTheme, withStyles, StyleRulesCallback } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import * as React from 'react';
// import {} from '@material-ui/core';
import { PopupSystem } from './components/PopupSystem';
import { SquareButton } from './components/controls/SquareButton';
import EventNames from './helpers/EventNames';
import Language from './helpers/Language';
import StateService, { AppState } from './helpers/StateService';
import { CreateLecture } from './scenes/CreateLecture';
import { LectureOverview } from './scenes/LectureOverview';

type AppBarButtonType = 'back' | 'menu';

const APP_BAR_HEIGHT: number = 50;

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#1565C0'
        },
        background: {
            default: '#272727'
        }
    }
});

type AppClassKey = 'root';
type PropType = object & WithStyles<AppClassKey>;
const style: StyleRulesCallback<AppClassKey> = () => ({
    root: {
        backgroundColor: theme.palette.background.default,
        marginTop: APP_BAR_HEIGHT + 'px',
        width: '100vw',
        height: 'calc(100vh - ' + APP_BAR_HEIGHT + 'px)',
        paddingTop: '20px',
        paddingBottom: '8px',
        paddingLeft: '20px',
        paddingRight: '20px'
    }
});

interface State {
    isDrawerOpen: boolean;
    scene: React.ReactNode;
    appBarTitle: string;
    appBarButtonType: AppBarButtonType;
}

class ClassApp extends React.Component<PropType, State> {
    private popupSystem: React.RefObject<PopupSystem>;

    constructor(props: PropType) {
        super(props);

        this.state = {
            scene: <></>,
            isDrawerOpen: false,
            appBarTitle: '',
            appBarButtonType: 'back'
        };

        this.popupSystem = React.createRef();

        this.createLecture = this.createLecture.bind(this);
        this.onAppStateChanged = this.onAppStateChanged.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);

        StateService.registerListener(this.onAppStateChanged);

        ipcRenderer.on(EventNames.M_EV_CREATE_LECTURE, this.createLecture);
    }

    componentDidMount() {
        StateService.setState(AppState.OVERVIEW_LECTURE);

        // FIXME: Nur zum Entwickeln - REMOVE ME!
        StateService.setState(AppState.CREATE_LECTURE);
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                {/* PopupSystem */}
                <PopupSystem ref={this.popupSystem} />

                {/* AppBar */}
                <AppBar style={{ height: APP_BAR_HEIGHT + 'px' }} >
                    <Toolbar
                        style={{
                            height: '100%',
                            minHeight: '0',
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                    >
                        <Grid container alignItems='center' spacing={8} style={{ height: '35px' }} >
                            <Grid item>
                                {this.state.appBarButtonType === 'menu' &&
                                    // TODO: Funktionalität
                                    <SquareButton
                                        onClick={() => this.toggleDrawer(true)}
                                    // tooltip={
                                    //     <Typography variant='body2' >
                                    //         {Language.getString('TOOLTIP_APP_BAR_MENU')}
                                    //     </Typography>
                                    // }
                                    >
                                        <i className='far fa-bars' ></i>
                                    </SquareButton>
                                }
                                {this.state.appBarButtonType === 'back' &&
                                    <SquareButton
                                        onClick={() => StateService.goBack()}
                                    // tooltip={
                                    //     <Typography variant='body2' >
                                    //         {Language.getString('TOOLTIP_APP_BAR_BACK')}
                                    //     </Typography>
                                    // }
                                    >
                                        <i className='far fa-angle-left' ></i>
                                    </SquareButton>
                                }
                            </Grid>
                            <Grid item xs>
                                <Typography variant='subheading'>
                                    {this.state.appBarTitle}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>

                {/* Drawer */}
                <Drawer anchor='left' open={this.state.isDrawerOpen} onClose={() => this.toggleDrawer(false)} >
                    <div
                        role='button'
                        onClick={() => this.toggleDrawer(false)}
                        onKeyDown={() => this.toggleDrawer(false)}
                    >
                        <List>
                            <ListSubheader>
                                Vorlesung
                            </ListSubheader>
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
                                    <i className='fas fa-pen' ></i>
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

                {/* Main Scene. */}
                <div
                    className={this.props.classes.root}
                >
                    {this.state.scene}
                </div>
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