import { Dialog, DialogContent, DialogContentText, DialogTitle, Button } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import * as React from 'react';
import Language from '../helpers/Language';
import { remote, ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateCheckResult } from 'electron-updater';

declare const __static: string;

interface State {
    author: string;
}

// TODO: Auto-Update & Updatebutton
export class InfoDialog extends React.Component<DialogProps, State> {
    constructor(props: DialogProps) {
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

        ipcRenderer.on('UPDATE-INFO', (_: any, update: UpdateCheckResult) => {
            console.log(update);
        });
    }

    render() {
        return (
            <Dialog
                {...this.props}
            >
                <DialogTitle>
                    {Language.getString('INFO_DIALOG_TITLE')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {/* Version will only be correct in the production version */}
                        {Language.getString('INFO_DIALOG_VERSION', `${remote.app.getVersion()}`)}
                    </DialogContentText>
                    <DialogContentText>
                        {Language.getString('INFO_DIALOG_PROGRAMMER', this.state.author)}
                    </DialogContentText>
                    <Button
                        variant='raised'
                        onClick={this.onSearchForUpdatesClicked}
                    >
                        Nach Updates suchen...
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    private onSearchForUpdatesClicked = () => {
        ipcRenderer.send('CHECK-FOR-UPDATES');
    }
}