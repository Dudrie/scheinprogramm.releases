import * as React from 'react';
import { System, Notification } from 'react-notification-system';
import * as NotificationSystem from 'react-notification-system';
import { Theme } from '@material-ui/core';
import { blueGrey } from '@material-ui/core/colors';

interface Props {
    theme: Theme;
}

const generateStyle = (theme: Theme): NotificationSystem.Style => ({
    NotificationItem: {
        DefaultStyle: {
            // backgroundColor: theme.palette.background.paper,
            backgroundColor: blueGrey['900'],
            color: '#ffffff',
            fontFamily: theme.typography.fontFamily,
            // border: '1px solid ' + theme.palette.primary.main,
            borderTopWidth: '4px',
            borderRadius: 0,
            boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)'
        },
        info: {
            borderTopColor: theme.palette.primary.dark,
        }
    },

    Title: {
        DefaultStyle: {
            fontWeight: 500,
            borderBottom: '1px solid ' + theme.palette.grey["600"]
        },
        info: {
            color: theme.palette.primary.light
        }
    },

    Dismiss: {
        DefaultStyle: {
            backgroundColor: 'transparent'
        }
    }
});

export class NotificationService extends React.Component<Props, object> {
    private static notificationSystem: System | null = null;
    private notifcationStyle: NotificationSystem.Style;

    public static showNotification(notification: Notification) {
        if (!this.notificationSystem) {
            throw new Error('There is no NotificationSystem given. Did you include the component in your app at least once?');
        }

        this.notificationSystem.addNotification(notification)
    }

    constructor(props: Props) {
        super(props);

        this.notifcationStyle = generateStyle(this.props.theme);
    }

    render() {
        return <NotificationSystem ref={this.onRef} style={this.notifcationStyle} />;
    }

    private onRef = (system: System | null) => {
        if (!system) {
            return;
        }

        NotificationService.notificationSystem = system;
    }
}