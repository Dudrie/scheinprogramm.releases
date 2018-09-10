import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import { remote, ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import Language from '../helpers/Language';
import EventNames from '../helpers/EventNames';

declare const __static: string;

interface State {
    author: string;
}

type InfoDialogClassKey =
    | 'root'
    | 'content'
    | 'updateButton';
type PropType = DialogProps & WithStyles<InfoDialogClassKey>;
const style: StyleRulesCallback<InfoDialogClassKey> = (theme) => ({
    root: {

    },
    content: {
        display: 'flex',
        flexDirection: 'column'
    },
    updateButton: {
        flexGrow: 0,
        marginTop: theme.spacing.unit,
        justifySelf: 'flex-end'
    }
});

// TODO: Auto-Update & Updatebutton
class InfoDialogClass extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        let author: string = '';

        try {
            let info = JSON.parse(fs.readFileSync(
                path.join(__static, 'info.json')
            ).toString());

            author = info.author;
        } catch (e) {
            console.error(e);
        }

        this.state = {
            author
        };
    }

    render() {
        let { classes, ...other } = this.props;
        return (
            <Dialog
                {...other}
            >
                <DialogTitle>
                    {Language.getString('INFO_DIALOG_TITLE')}
                </DialogTitle>
                <DialogContent
                    className={classes.content}
                >
                    <DialogContentText>
                        {/* Version will only be correct in the production version */}
                        {Language.getString('INFO_DIALOG_VERSION', `${remote.app.getVersion()}`)}
                    </DialogContentText>
                    <DialogContentText>
                        {Language.getString('INFO_DIALOG_PROGRAMMER', this.state.author)}
                    </DialogContentText>
                    <Button
                        variant='raised'
                        color='primary'
                        onClick={this.onSearchForUpdatesClicked}
                        className={classes.updateButton}
                    >
                        {Language.getString('INFO_DIALOG_SEARCH_FOR_UPDATES')}...
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    private onSearchForUpdatesClicked = () => {
        ipcRenderer.send(EventNames.UPDATE_CHECK_FOR_UPDATES);
    }
}

export const InfoDialog = withStyles(style)<DialogProps>(InfoDialogClass);