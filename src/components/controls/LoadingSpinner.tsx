import * as React from 'react';
import { CSSProperties } from 'react';

interface Props {
    radius?: number;
    barWidth?: number;
    padding?: number;
}

export class LoadingSpinner extends React.Component<Props, object> {
    render() {
        // let outerColor: string = '#cd853f';
        let innerColor: string = '#303030';

        let innerRadius: number = this.props.radius ? this.props.radius : 30;
        let innerBorderWidth: number = 6;
        let barWidth: number = this.props.barWidth ? this.props.barWidth : 25;
        let padding: number = this.props.padding ? this.props.padding : 15;
        let barCount: number = 18;
        let size: number = (innerRadius + innerBorderWidth + padding + barWidth) * 2;
        let animationDuration: number = barCount * 100;
        // let totalDuration = animationDuration * barCount;
        let bars: JSX.Element[] = [];

        let spinnerStyle: CSSProperties = {
            position: 'relative',
            width: size + 'px',
            height: size + 'px'
        };

        let circleOffsetTop = (size / 2) - (innerRadius - innerBorderWidth / 2);
        let circleOffsetLeft = (size / 2) - (innerRadius);
        let center = innerRadius;

        let circleStyle: CSSProperties = {
            animation: 'spinner-spin-circle ' + (animationDuration * 1.5) + 'ms linear infinite',
            animationDelay: (-animationDuration / 6) + 'ms',
            width: (innerRadius * 2) + 'px',
            height: innerRadius + 'px',
            borderTopLeftRadius: innerRadius + 'px',
            borderTopRightRadius: innerRadius + 'px',
            border: innerBorderWidth + 'px solid ' + innerColor,
            borderBottom: '0',
            position: 'absolute',
            top: circleOffsetTop + 'px',
            left: circleOffsetLeft + 'px',
            transformOrigin: (center) + 'px ' + (center) + 'px'
        };

        for (let i = 0; i < barCount; i++) {
            let barStyle: CSSProperties = {
                animation: 'spinner-spin-tick ' + animationDuration + 'ms linear infinite',
                animationDelay: (i - barCount) * 100 + 'ms',
                position: 'absolute',
                top: (size / 2) + 'px',
                left: ((size - barWidth) / 2) + 'px',
                width: barWidth + 'px',
                height: '6px',
                borderRadius: '0px',
                transform: 'rotate(' + (i * (360 / barCount)) + 'deg) translate(' + ((size - 2 * barWidth) / 2) + 'px)'
            };

            bars.push(<div style={barStyle} className='react-spinner_bar' key={i} ></div>);
        }

        return (
            <div style={spinnerStyle} >
                {bars}
                <div style={circleStyle} ></div>
            </div>
        );
    }
}