'use client'

import React from 'react'

/**
 * TailwindCSS 测试主页面
 * 包含各种TailwindCSS特性的测试和示例
 */
export default function TailwindTestPage() {
    return (
        // <div className='bg-red-500'>
        //     aaa
        //     <div className='bg-blue-500'>
        //         bbb
        //     </div>
        // </div>
        <div className="container min-h-xxl bg-blue-50">
            aaa
            <div className="min-h-full w-10 bg-red-50">
                bbb
                <div className="min-h-full w-10 bg-red-50 p-[10px]">ccc</div>
                <div className="min-h-full w-10 bg-red-50 p-[20px]">ddd</div>
                <div className="min-h-full w-10 bg-red-50 p-[30px]">eee</div>
                <div className="min-h-full w-10 bg-red-50 p-[40px]">fff</div>
                <div className="min-h-full w-10 bg-red-50 p-[50px]">ggg</div>
                <div className="min-h-full w-10 bg-red-50 p-[60px]">hhh</div>
                <div className="min-h-full w-10 bg-red-50 p-[70rem]">iii</div>
                <div className="min-h-full w-10 bg-red-50 p-[80rem]">jjj</div>
                <div className="min-h-full w-10 bg-red-50 p-[90rem]">kkk</div>
            </div>
        </div>

    )
}