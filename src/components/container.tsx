"use client"

import React from 'react'

interface ContainerProps {
    children: React.ReactNode;
    className?: string
}

const Container: React.FC<ContainerProps> = ({
    children,
    className,
}) => {
    return (
        <div className={`w-full h-full px-4 lg:px-8 2xl:px-12 4xl:px-16 lg:container lg:mx-auto ${className}`}>
            {children}
        </div>
    )
}

export default Container
