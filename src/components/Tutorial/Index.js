import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';

const TutorialComponent = ({ steps, onComplete }) => {
   const [tour, setTour] = useState({
      autoStart: true,
      steps: steps,
   });


   useEffect(() => {
      if (onComplete) {
         // Chame a função onComplete quando o tutorial for concluído
         setTour({ run: false, steps: [] });
         onComplete();
      }
   }, [onComplete]);

   return <Joyride {...tour} />;
};

export default TutorialComponent;