import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typography, Tooltip } from '@material-ui/core';
import * as React from 'react';
import { LectureSystem } from '../../data/LectureSystem';
import { Points, Sheet } from '../../data/Sheet';
import Language from '../../helpers/Language';
import { DeleteButton } from '../controls/DeleteButton';
import { SystemOverviewBox } from '../SystemOverviewBox';
import { InfoBar, InfoBarProps } from './InfoBar';
import { SquareButton } from '../controls/SquareButton';

interface Props extends InfoBarProps {
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
        let { sheet, lectureSystems, ...other } = this.props;
        let date: string = sheet.date.toLocaleDateString(
            undefined,
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
            }
        );
        return (
            <InfoBar
                onInfoClicked={this.onInfoClicked}
                infos={this.state.isShowAddInfo ? this.state.infoToShow : undefined}
                addButtons={[
                    <SquareButton
                        variant='raised'
                        // TODO: Bearbeiten-Funktionalität einbauen
                        disabled
                    >
                        <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'pencil' }} />
                    </SquareButton>,
                    <DeleteButton
                        variant='raised'
                        tooltipElement={Language.getString('SHEET_BAR_CONFIRM_DELETE_SHEET')}
                    >
                        <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'trash-alt' }} />
                    </DeleteButton>
                ]}
                {...other}
            >
                <div style={{ flex: 1, marginRight: '8px' }}>
                    <Typography variant='subheading'  >
                        {Language.getString('SHEET_NUMBER') + ': ' + sheet.sheetNr}
                        {sheet.hasPresented && (
                            <Tooltip title={Language.getString('SHEET_HAS_PRESENTED')} >
                                <FontAwesomeIcon style={{ marginLeft: '8px' }} icon={{ prefix: 'fas', iconName: 'comment-alt-smile' }} />
                            </Tooltip>
                        )}
                    </Typography>
                    <Typography variant='caption'>
                        {Language.getString('SHEET_DATE') + ': ' + date}
                    </Typography>
                </div>
            </InfoBar>
        );
    }

    private createInfoToShow(): React.ReactNode {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    flexGrow: 1,
                    justifyContent: 'space-between'
                }}
            >
                {this.props.lectureSystems.map((s, idx) => {
                    let points: Points = this.props.sheet.getPoints(s.id);

                    return (
                        <SystemOverviewBox
                            key={this.props.sheet.sheetNr + '_SYSTEM_INFO_' + idx}
                            // flexBasis and minWidth are both needed, bc if one is omitted there's one extra row if only row should've been shown.
                            style={{
                                margin: '8px',
                                padding: '8px',
                                flexGrow: 1,
                                flexBasis: '20%',
                                minWidth: '20%'
                            }}
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