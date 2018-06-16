import { Button, Checkbox, Fade, FormControl, FormControlLabel, FormGroup, Grid, Paper, StyleRulesCallback, TextField, Theme, Typography, WithStyles, withStyles, Zoom } from '@material-ui/core';
import * as React from 'react';
import { CreateBar } from '../components/controls/CreateBar';
import { DeleteButton } from '../components/controls/DeleteButton';
import { InfoBar } from '../components/controls/InfoBar';
import { NumberInput } from '../components/controls/NumberInput';
import { SquareButton } from '../components/controls/SquareButton';
import { SystemEditor } from '../components/SystemEditor';
import { LectureSystem } from '../data/LectureSystem';
import Language from '../helpers/Language';
import StateService from '../helpers/StateService';

interface Props {

}

interface State {
    isEditingSystem: boolean;
    lectureSystems: LectureSystem[];
}

type CreateLectureClassKey =
    | 'root'
    | 'generalInfoDiv'
    | 'generalInfoPaper'
    | 'systemsDiv'
    | 'systemOverviewList'
    | 'buttonBox';

const style: StyleRulesCallback<CreateLectureClassKey> = (theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'flex-start',
        height: '100%'
    },
    generalInfoDiv: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start'
    },
    generalInfoPaper: {
        flex: 1,
        marginRight: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 1.5
    },
    systemsDiv: {
        // backgroundColor: 'purple',
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing.unit * 1.5,
        position: 'relative',
        border: '2px solid ' + theme.palette.divider,
        '&> h3': {
            marginBottom: theme.spacing.unit
        }
    },
    systemOverviewList: {
        position: 'absolute',
        left: theme.spacing.unit * 1.5,
        right: theme.spacing.unit * 1.5,
        paddingBottom: theme.spacing.unit
    },
    buttonBox: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        marginTop: theme.spacing.unit * 2
    }
});
type PropType = Props & WithStyles<CreateLectureClassKey>;

// TODO: Wenn Lecture in Prop übergeben, dann wird das ganze zu einer Edit-Scene?
class CreateLectureClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            isEditingSystem: true,
            lectureSystems: []
        };

        // FIXME: Nur zum Testen da.
        // for (let i = 0; i < 15; i++) {
        //     this.state.lectureSystems.push(DataService.generateLectureSystem(
        //         'SYSTEM_' + i,
        //         'SHORT',
        //         SystemType.ART_PROZENT,
        //         0,
        //         0,
        //         true
        //     ));
        // }
    }

    render() {
        return (
            <div className={this.props.classes.root} >
                <div className={this.props.classes.generalInfoDiv} >
                    <Paper square elevation={5} className={this.props.classes.generalInfoPaper} >
                        <Grid container direction='column' spacing={16} >
                            <Grid item>
                                <Typography variant='subheading' >
                                    {Language.getString('CREATE_LECTURE_DETAIL_OVERVIEW')}
                                </Typography>
                            </Grid>
                            <Grid item>
                                {/* TODO: Name */}
                                <TextField
                                    type='text'
                                    label='Name'
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                {/* TODO: Anzahl Blätter */}
                                <NumberInput
                                    label='Anzahl Blätter'
                                />
                            </Grid>
                            <Grid item>
                                {/* TODO: Vorrechenpunkte */}
                                <FormGroup>
                                    <FormControlLabel
                                        control={<Checkbox color='primary' />}
                                        label='Vorrechenpunkte erforderlich'
                                    />
                                    <FormControl>
                                        <NumberInput
                                            label='Vorrechenpunkte'
                                        />
                                    </FormControl>
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Paper>

                    <div className={this.props.classes.systemsDiv}>
                        <Fade
                            in={!this.state.isEditingSystem}
                            // Make sure this element is unmounted while the system-editor is shown so there are no unneccessary scrollbars
                            unmountOnExit
                            timeout={400}
                        >
                            <div className={this.props.classes.systemOverviewList} >
                                <Typography variant='subheading' >
                                    {Language.getString('CREATE_LECTURE_OVERVIEW_LECTURE_SYSTEMS')}
                                </Typography>
                                <Grid container direction='column' spacing={8} >
                                    <Grid item xs>
                                        <CreateBar
                                            onCreateClicked={this.showEditor}
                                            color='default'
                                            variant='outlined'
                                            elevation={0}
                                        >
                                            {Language.getString('CREATE_LECTURE_CREATE_SYSTEM')}
                                        </CreateBar>
                                    </Grid>
                                    {this.state.lectureSystems.map((sys, idx) =>
                                        <Grid key={sys.id + idx} item xs>
                                            <InfoBar
                                                elevation={0}
                                                addButtons={[
                                                    // TODO: Listener einfügen
                                                    <SquareButton variant='outlined' >
                                                        <i className='far fa-pen' ></i>
                                                    </SquareButton>,
                                                    <DeleteButton variant='outlined'>
                                                        <i className='far fa-trash-alt' ></i>
                                                    </DeleteButton>
                                                ]}
                                                hideInfoButton
                                            >
                                                {sys.name}
                                            </InfoBar>
                                        </Grid>
                                    )}
                                </Grid>
                            </div>
                        </Fade>

                        <Zoom
                            in={this.state.isEditingSystem}
                            unmountOnExit
                            style={{ zIndex: 10 }}
                            timeout={500}
                        >
                            <SystemEditor
                                onSystemCreation={this.onSystemCreation}
                                onAbortClicked={this.onSystemCreationAbortion}
                            />
                        </Zoom>
                    </div>
                </div>

                <div className={this.props.classes.buttonBox} >
                    <Button color='secondary' variant='outlined' style={{ borderRadius: '0', marginRight: '8px' }} onClick={() => StateService.goBack()} >
                        {Language.getString('BUTTON_ABORT')}
                    </Button>
                    <Button color='primary' variant='raised' style={{ borderRadius: '0' }}>
                        {Language.getString('BUTTON_CREATE')}
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Gets called after the LectureSystem is created by the SystemEditor.
     * @param sys Created LectureSystem
     */
    private onSystemCreation = (sys: LectureSystem) => {
        this.state.lectureSystems.push(sys);
        this.hideEditor();

    }

    /**
     * Gets called if the creation/editing of a lecture system is aborted.
     */
    private onSystemCreationAbortion = () => {
        this.hideEditor();
    }

    /**
     * Called when the SystemEditor should be shown.
     */
    private showEditor = () => {
        this.setState({ isEditingSystem: true });
    }

    /**
     * Called when the SystemEditor should be hidden.
     */
    private hideEditor() {
        this.setState({
            isEditingSystem: false,
        });
    }
}

/**
 * Scene for creating a lecture. Lets the user input all information needed and handles the communication with the DataService in all relevant cases.
 */
export const CreateLecture = withStyles(style)<Props>(CreateLectureClass);