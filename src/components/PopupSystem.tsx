import { Paper } from '@material-ui/core';
import * as React from 'react';
import { CSSProperties } from 'react';

interface Props {

}

interface State {
    showPopup: boolean;
    content: React.ReactNode;
    openingTime: number;
}

let styleOuter: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 50
};

let styleInner: CSSProperties = {
    margin: '30px',
    marginLeft: '50px', // DON'T CHANGE THIS (Buttons)
    width: '100%'
};

let btnStyle: React.CSSProperties = {
    height: '35px',
    width: '35px',
    marginBottom: '7px'
};

// TODO: onClose-Funktion, die das Schließen verhindern kann.
export class PopupSystem extends React.Component<Props, State> {
    private refInner: React.RefObject<HTMLDivElement>;
    private lastKeyIdx: number = -1;

    constructor(props: Props) {
        super(props);

        this.state = {
            showPopup: false,
            content: <></>,
            openingTime: 0
        };

        this.refInner = React.createRef();

        this.onClicked = this.onClicked.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    render() {
        if (!this.state.showPopup) {
            return null;
        }

        return (
            <>
                <div style={styleOuter} className='background-light-opacity-75' onClick={this.onClicked} >
                    <Paper
                        square
                        style={styleInner}
                        className='border-accent-dark-thick'
                        elevation={10}
                    >
                        <div
                            ref={this.refInner}
                            style={{
                                width: '100%',
                                height: '100%',
                                padding: '10px'
                            }}
                        >
                            {this.state.content}
                        </div>
                    </Paper>
                </div>
            </>
        );
    }

    private onClicked(event: React.MouseEvent<HTMLDivElement>) {
        // Make sure, the popup can't be dismissed right after it's created. This is to prevent accidentally closing the popup by double-clicking on the 'opening-button' (ie MenuItem).
        if (Date.now() < this.state.openingTime + 500) {
            return;
        }

        let el: HTMLElement | null = event.target as HTMLElement;

        if (!this.isElementInInner(el)) {
            this.hidePopup();
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.hidePopup();
        }
    }

    private isElementInInner(elementToCheck: HTMLElement): boolean {
        if (this.refInner.current == null) {
            return false;
        }

        let el: HTMLElement | null = elementToCheck;

        while (el !== null) {
            if (el === this.refInner.current) {
                // We found our inner div as parent to the given element.
                return true;
            }

            el = el.parentElement;
        }

        return false;
    }

    /**
     * Shows a popup with the given content. If one is already showing, it's contents are replaced (there won't be an additional popup).
     * @param content Content to show in the popup
     */
    public showPopup(content: React.ReactNode) {
        document.addEventListener('keyup', this.onKeyUp);
        
        this.setState({
            showPopup: true,
            content,
            openingTime: Date.now()
        });
    }

    /**
     * Hide the popup if one is shown.
     */
    public hidePopup() {
        document.removeEventListener('keyup', this.onKeyUp);

        this.setState({
            showPopup: false,
            content: <></>
        });
    }
}