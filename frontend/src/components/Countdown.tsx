import React, {useEffect, useState} from 'react';
import {DateInput, useLocalSettings} from '../hooks/useLocalSettings';

interface CountdownProps {
  targetDate: DateInput;
  as?: React.ElementType;
}

const Countdown: React.FC<CountdownProps> = ({
                                               targetDate,
                                               as: Component = 'span'
                                             }) => {
  const [{formatCountdown}] = useLocalSettings();
  const [timeLeft, setTimeLeft] = useState(formatCountdown(targetDate));

  useEffect(() => {
    const intervalId = setInterval(() => {
      const formattedTime = formatCountdown(targetDate);
      setTimeLeft(formattedTime);

      if (formattedTime === '00:00:00') {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate, formatCountdown]);

  return <Component>{timeLeft}</Component>;
};

export default Countdown;
