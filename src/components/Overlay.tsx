import * as React from 'react';
import { LoadingSpinner } from './controls/LoadingSpinner';

interface Props {
    overlayText?: string;
    width?: number | string;
    height?: number | string;
}

export class Overlay extends React.Component<Props, object> {

    componentDidMount() {
        window.addEventListener('resize', () => this.forceUpdate());
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.forceUpdate());
    }

    render() {
        if (!this.props.overlayText) {
            // Don't render the overlay if no text is present.
            return null;
        }

        let style: React.CSSProperties = {
            width: this.props.width ? this.props.width : '100vw',
            height: this.props.height ? this.props.height : '100vh',
            display: 'flex',
            flexFlow: 'row wrap'
        };

        return (
            <>
                <div style={style} className='app-overlay' >
                    <div className='display-as-grid grid-row-gap-5' style={{marginTop: '20px'}} >
                        <div style={{ gridArea: '1 / 1', justifySelf: 'center' }} className='app-overlay-text' >
                            {this.props.overlayText}
                        </div>
                        <div style={{ gridArea: '1 / 1', justifySelf: 'center' }}>
                            <LoadingSpinner />
                        </div>
                    </div>
                </div>
            </>
        );
    }
}