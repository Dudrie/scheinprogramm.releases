import * as React from 'react';
import { System, Notification } from 'react-notification-system';
import * as NotificationSystem from 'react-notification-system';
import { Theme } from '@material-ui/core';
import { blueGrey } from '@material-ui/core/colors';

interface Props {
    /**
     * Material-UI Theme which is used throughout the app. Used to generate the style of the notifications.
     */
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
            borderBottom: '1px solid ' + theme.palette.grey['600'],
            paddingBottom: theme.spacing.unit / 2,
            marginBottom: theme.spacing.unit
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

/**
 * Service, which bundles the NotificationSystem and corresponding functions into one component. It is used in two ways:
 * 1. The component to set the "location" of the NotificationSystem
 * 2. The static functions to actually display notifications.
 *
 * Make sure that you include and load this component somewhere in your app before calling any of the static methods.
 *
 * This component is based on the material-ui therefore a material-ui theme has to be provided via the properties. The style of the Notification will get generated from that given theme.
 */
export class NotificationService extends React.Component<Props, object> {
    private static notificationSystem: System | null = null;
    private notifcationStyle: NotificationSystem.Style;

    /**
     * Shows a Notification with the given settings. For more information on the settings refer to the settings page on the creator's GitHub.
     * @param notification Notification to show
     */
    public static showNotification(notification: Notification) {
        if (!this.notificationSystem) {
            throw new Error('There is no NotificationSystem given. Did you include the component in your app at least once?');
        }

        this.notificationSystem.addNotification(notification);
    }

    constructor(props: Props) {
        super(props);

        this.notifcationStyle = generateStyle(this.props.theme);
    }

    render() {
        return <NotificationSystem ref={this.onRef} style={this.notifcationStyle} />;
    }

    /**
     * Called when the NotificationSystem and a ref on it are created. Will set the static reference to the NotificationSystem.
     */
    private onRef = (system: System | null) => {
        if (!system) {
            return;
        }

        NotificationService.notificationSystem = system;
    }
}