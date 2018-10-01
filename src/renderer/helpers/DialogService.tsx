import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { InfoDialog } from '../view/InfoDialog';

type ActionParams = {
    label: string,
    onClick: React.MouseEventHandler<HTMLElement>,
    buttonProps?: ButtonProps
};

interface State {
    openDialog: React.ReactNode | undefined;
}

export class DialogService extends React.Component<object, object> {
    private static refDialogComp: React.RefObject<DialogServiceComponent> = React.createRef();

    public static showDialog(title: string, contentText: string, actions: ActionParams[]) {
        if (!DialogService.refDialogComp.current) {
            return;
        }

        let openDialog: React.ReactNode = (
            <Dialog
                open
                onClose={() => DialogService.closeDialog()}
                TransitionComponent={(props) => <Slide direction='down' timeout={100} unmountOnExit {...props} />}
            >
                <DialogTitle>{title}</DialogTitle>

                <DialogContent>
                    <DialogContentText>{contentText}</DialogContentText>
                </DialogContent>

                <DialogActions>
                    {actions.map((action, idx) => (
                        <Button
                            key={`DIALOG_ACTION_${idx}`}
                            onClick={action.onClick}
                            {...action.buttonProps}
                        >
                            {action.label}
                        </Button>
                    ))}
                </DialogActions>
            </Dialog>
        );

        DialogService.refDialogComp.current.setState({
            openDialog
        });
    }

    public static showInfoDialog() {
        if (!DialogService.refDialogComp.current) {
            return;
        }

        DialogService.refDialogComp.current.setState({
            openDialog: <InfoDialog
                open
                onClose={() => DialogService.closeDialog()}
            />
        });
    }

    public static closeDialog() {
        if (!DialogService.refDialogComp.current) {
            return;
        }

        DialogService.refDialogComp.current.setState({
            openDialog: undefined
        });
    }

    constructor(props: object) {
        super(props);

        this.state = {
            openDialog: undefined
        };
    }

    render() {
        return (<DialogServiceComponent ref={DialogService.refDialogComp} />);
    }
}

class DialogServiceComponent extends React.Component<object, State> {
    constructor(props: object) {
        super(props);

        this.state = {
            openDialog: undefined
        };
    }

    render() {
        return (<>
            {this.state.openDialog}
        </>);
    }
}