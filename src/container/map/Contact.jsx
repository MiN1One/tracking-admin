import { Box, Flex, Text } from '@chakra-ui/react';
import { Button } from 'antd';
import Icon from 'feather-icons-react';
import { useMemo } from 'react';

const alertActions = [
  {
    label: 'Late to delivery',
    value: 'alarm_late_to_del',
    type: 'primary',
  },
  {
    label: 'Late to pickup',
    value: 'alarm_late_to_pickup',
    type: 'primary',
  },
  {
    label: 'Alarm to call back',
    value: 'alarm_get_in_touch',
    type: 'primary',
  },
  {
    label: 'Relogin Driver',
    value: 'relogin',
    type: 'primary',
  },
  {
    label: 'Reload connection',
    value: 'reload',
    type: 'primary',
  },
  {
    label: 'Clear credentials',
    value: 'force_clear_credentials',
    type: 'danger',
  },
];

export const Contact = ({
  activeDriverContact,
  setActiveDriverContact,
  pointsRecord,
  loading,
  onSendAction
}) => {
  const actionButtonEls = useMemo(() => {
    return alertActions.map((action) => {
      return (
        <Button
          key={action.value}
          ghost
          type="primary"
          loading={loading}
          onClick={() => onSendAction(action.value)}
          {...{ [action.type]: true }}
        >
          {action.label}
        </Button>
      );
    });
  }, [loading]);

  const activeDriverPoint = pointsRecord[activeDriverContact];

  return (
    <div className="drivers__actions" data-active={Boolean(activeDriverContact)}>
      <div>
        <Button onClick={() => setActiveDriverContact(null)}>
          <Icon icon="arrow-right" />
        </Button>
        Driver Actions
      </div>
      <Box>
        <Text fontSize="16px">{activeDriverPoint?.full_name}</Text>
        <Flex justifyContent="center" direction="column" gap="10px">
          {actionButtonEls}
        </Flex>
      </Box>
    </div>
  );
};
