import { Box, Typography, Paper } from '@mui/material';
import { format } from 'date-fns';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  outboundBubble: {
    backgroundColor: '#dcf8c6',
    borderRadius: '10px 0 10px 10px',
    padding: '8px 12px',
    maxWidth: '80%',
    minWidth: '100px',
    marginLeft: 'auto',
    position: 'relative',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
    '&:after': {
      content: '""',
      position: 'absolute',
      right: '-10px',
      top: 0,
      width: 0,
      height: 0,
      borderTop: '10px solid #dcf8c6',
      borderRight: '10px solid transparent',
    }
  },
  inboundBubble: {
    backgroundColor: 'white',
    borderRadius: '0 10px 10px 10px',
    padding: '8px 12px',
    maxWidth: '80%',
    minWidth: '100px',
    marginRight: 'auto',
    position: 'relative',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '-10px',
      top: 0,
      width: 0,
      height: 0,
      borderTop: '10px solid white',
      borderLeft: '10px solid transparent',
    }
  },
  timestamp: {
    fontSize: '11px',
    color: 'rgba(0, 0, 0, 0.5)',
    marginLeft: '8px',
    display: 'inline-block',
  },
  readStatus: {
    fontSize: '14px',
    color: '#4fc3f7',
    verticalAlign: 'bottom',
    marginLeft: '2px',
  }
}));

export default function WhatsAppChatBubble({ message, isOutbound = false, timestamp, isRead = false }) {
  const classes = useStyles();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
      <Paper 
        elevation={0} 
        className={isOutbound ? classes.outboundBubble : classes.inboundBubble}
      >
        <Typography variant="body1">
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5 }}>
          <Typography variant="caption" className={classes.timestamp}>
            {format(new Date(timestamp), 'h:mm a')}
          </Typography>
          {isOutbound && (
            <DoneAllIcon 
              className={classes.readStatus} 
              sx={{ 
                color: isRead ? '#4fc3f7' : 'rgba(0, 0, 0, 0.3)',
                fontSize: 16,
                ml: 0.5
              }} 
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
} 