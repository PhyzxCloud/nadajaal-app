import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ className, ...props }) => {
  return (
    <SliderPrimitive.Root
      className={`relative flex items-center select-none touch-none w-full h-5 ${className}`}
      {...props}
    >
      <SliderPrimitive.Track className="bg-gray-200 relative grow rounded-full h-1">
        <SliderPrimitive.Range className="absolute bg-blue-600 rounded-full h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-600 rounded-full border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300" />
    </SliderPrimitive.Root>
  );
};

export { Slider };
