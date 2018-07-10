import { Typography } from '@material-ui/core';
import * as React from 'react';
import { DeleteButton } from '../controls/DeleteButton';
import { InfoBar } from './InfoBar';
import Language from '../../helpers/Language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Sheet, Points } from '../../data/Sheet';
import { LectureSystem } from '../../data/LectureSystem';
import { SystemOverviewBox } from '../SystemOverviewBox';

interface Props {
    sheet: Sheet;
    lectureSystems: LectureSystem[];
}

interface State {
    isShowAddInfo: boolean;
    infoToShow: React.ReactNode;
}

export class SheetBar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isShowAddInfo: false,
            infoToShow: this.createInfoToShow()
        };

        this.onInfoClicked = this.onInfoClicked.bind(this);
    }

    render() {
        return (
            <InfoBar
                onInfoClicked={this.onInfoClicked}
                infos={this.state.isShowAddInfo ? this.state.infoToShow : undefined}
                addButtons={[
                    <DeleteButton
                        variant='raised'
                        tooltipElement={Language.getString('SHEET_BAR_CONFIRM_DELETE_SHEET')}
                    >
                        <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'trash-alt' }} />
                    </DeleteButton>
                ]}
            >
                <div style={{ flex: 1, marginRight: '8px' }}>
                    <Typography variant='subheading'>
                        {Language.getString('SHEET_NUMBER') + ': ' + this.props.sheet.sheetNr}
                    </Typography>
                    <Typography variant='caption'>
                        {/* TODO: DateString schöner formatieren? */}
                        {Language.getString('SHEET_DATE') + ': ' + this.props.sheet.date.toLocaleDateString()}
                    </Typography>
                </div>
            </InfoBar>
        );
    }

    private createInfoToShow(): React.ReactNode {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                {this.props.lectureSystems.map((s, idx) => {
                    let points: Points = this.props.sheet.getPoints(s.id);

                    return (
                        <SystemOverviewBox
                            key={this.props.sheet.sheetNr + '_SYSTEM_INFO_' + idx}
                            // flexBasis and minWidth are both needed, bc if one is omitted there's one extra row if only row should've been shown.
                            style={{ margin: '8px', padding: '8px', flexGrow: 1, flexBasis: '33%', minWidth: '20%' }}
                            systemName={s.name}
                            pointsEarned={points.achieved}
                            pointsTotal={points.total}
                            disableCollapse
                        />
                    );
                })}
            </div>
        );
    }

    private onInfoClicked() {
        this.setState({
            isShowAddInfo: !this.state.isShowAddInfo
        });
    }
}