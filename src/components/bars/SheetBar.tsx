import { Typography } from '@material-ui/core';
import * as React from 'react';
import { DeleteButton } from '../controls/DeleteButton';
import { InfoBar } from './InfoBar';
import Language from '../../helpers/Language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface State {
    isShowAddInfo: boolean;
}

export class SheetBar extends React.Component<object, State> {
    constructor(props: object) {
        super(props);

        this.state = {
            isShowAddInfo: false
        };

        this.onInfoClicked = this.onInfoClicked.bind(this);
    }

    render() {
        let infoToShow: React.ReactNode = undefined;

        if (this.state.isShowAddInfo) {
            infoToShow = 'BLATT-INFOS IMPLEMENTIEREN';
        }

        return (
            <InfoBar
                onInfoClicked={this.onInfoClicked}
                infos={infoToShow}
                addButtons={[
                    <DeleteButton
                        variant='raised'
                        tooltipElement={Language.getString('SHEET_BAR_CONFIRM_DELETE_SHEET')}
                    >
                        <FontAwesomeIcon icon={{prefix: 'far', iconName: 'trash-alt'}} />
                    </DeleteButton>
                ]}
            >
                <div style={{ flex: 1, marginRight: '8px' }}>
                    <Typography variant='subheading'>
                        BLATT-NR
                    </Typography>
                    <Typography variant='caption'>
                        Datum: BLATT-DATUM
                    </Typography>
                </div>
            </InfoBar>
        );
    }

    private onInfoClicked() {
        this.setState({
            isShowAddInfo: !this.state.isShowAddInfo
        });
    }
}