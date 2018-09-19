import { Button, createStyles, Dialog, DialogContent, DialogContentText, DialogTitle, Theme, WithStyles, withStyles } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import { ipcRenderer, remote } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { Notification } from 'react-notification-system';
import { UpdateEvents } from '../../main/UpdateService';
import Language from '../helpers/Language';

declare const __static: string;

const style = (theme: Theme) => createStyles({
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

type Props = DialogProps & WithStyles<typeof style>;

interface State {
    author: string;
    progressNoti: Notification | undefined;
}

class InfoDialogClass extends React.Component<Props, State> {
    constructor(props: Props) {
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
            author,
            progressNoti: undefined
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
        // This is NOT a silent update.
        ipcRenderer.send(UpdateEvents.UPDATE_CHECK_FOR_UPDATES, false);
    }
}

export const InfoDialog = withStyles(style)(InfoDialogClass);