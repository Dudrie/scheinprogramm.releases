import { Dialog, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import * as React from 'react';
import Language from '../helpers/Language';
import { remote } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

declare const __static: string;

interface State {
    author: string;
}

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
                </DialogContent>
            </Dialog>
        );
    }
}