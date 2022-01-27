/**
 * Extra social icons that are not available in the standard material ui icons
 * list
 * 
 * @module
 */

import React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const wechatsrc = <><path fill="#2DC100" d="M300 255c0 24.854-20.147 45-45 45H45c-24.854 0-45-20.146-45-45V45C0 20.147 20.147 0 45 0h210c24.853 0 45 20.147 45 45v210z"/><g fill="#FFF"><path d="M200.803 111.88c-24.213 1.265-45.268 8.605-62.362 25.188-17.271 16.754-25.155 37.284-23 62.734-9.464-1.172-18.084-2.462-26.753-3.192-2.994-.252-6.547.106-9.083 1.537-8.418 4.75-16.488 10.113-26.053 16.092 1.755-7.938 2.891-14.889 4.902-21.575 1.479-4.914.794-7.649-3.733-10.849-29.066-20.521-41.318-51.232-32.149-82.85 8.483-29.25 29.315-46.989 57.621-56.236 38.635-12.62 82.054.253 105.547 30.927 8.485 11.08 13.688 23.516 15.063 38.224zm-111.437-9.852c.223-5.783-4.788-10.993-10.74-11.167-6.094-.179-11.106 4.478-11.284 10.483-.18 6.086 4.475 10.963 10.613 11.119 6.085.154 11.186-4.509 11.411-10.435zm58.141-11.171c-5.974.11-11.022 5.198-10.916 11.004.109 6.018 5.061 10.726 11.204 10.652 6.159-.074 10.83-4.832 10.772-10.977-.051-6.032-4.981-10.79-11.06-10.679z"/><path d="M255.201 262.83c-7.667-3.414-14.7-8.536-22.188-9.318-7.459-.779-15.3 3.524-23.104 4.322-23.771 2.432-45.067-4.193-62.627-20.432-33.397-30.89-28.625-78.254 10.014-103.568 34.341-22.498 84.704-14.998 108.916 16.219 21.129 27.24 18.646 63.4-7.148 86.284-7.464 6.623-10.15 12.073-5.361 20.804.884 1.612.985 3.653 1.498 5.689zm-87.274-84.499c4.881.005 8.9-3.815 9.085-8.636.195-5.104-3.91-9.385-9.021-9.406-5.06-.023-9.299 4.318-9.123 9.346.166 4.804 4.213 8.69 9.059 8.696zm56.261-18.022c-4.736-.033-8.76 3.844-8.953 8.629-.205 5.117 3.772 9.319 8.836 9.332 4.898.016 8.768-3.688 8.946-8.562.19-5.129-3.789-9.364-8.829-9.399z"/></g></>;
const vksrc = <><path d="M179.928 32h664.144C925.767 32 992 98.23 992 179.929v664.143C992 925.768 925.767 992 844.072 992H179.928C98.23 992 32 925.768 32 844.071V179.929C32 98.23 98.23 32 179.928 32" fill="#4c75a3"/><path d="M503.946 704.029h39.269s11.859-1.307 17.923-7.831c5.573-5.996 5.396-17.249 5.396-17.249s-.769-52.692 23.683-60.452c24.113-7.647 55.07 50.925 87.88 73.449 24.812 17.039 43.667 13.31 43.667 13.31l87.739-1.227s45.895-2.832 24.132-38.917c-1.782-2.947-12.679-26.693-65.238-75.48-55.02-51.062-47.644-42.801 18.626-131.128 40.358-53.79 56.49-86.628 51.449-100.691-4.803-13.399-34.489-9.86-34.489-9.86l-98.786.611s-7.328-.998-12.756 2.25c-5.31 3.177-8.717 10.599-8.717 10.599s-15.642 41.622-36.486 77.024c-43.988 74.693-61.58 78.647-68.771 74.002-16.729-10.811-12.549-43.422-12.549-66.596 0-72.389 10.98-102.57-21.381-110.384-10.737-2.591-18.646-4.305-46.11-4.585-35.25-.358-65.078.108-81.971 8.384-11.239 5.504-19.91 17.766-14.626 18.472 6.53.869 21.313 3.99 29.152 14.655 10.126 13.776 9.772 44.703 9.772 44.703s5.818 85.213-13.585 95.795c-13.314 7.26-31.582-7.561-70.8-75.327-20.091-34.712-35.265-73.085-35.265-73.085s-2.922-7.17-8.141-11.008c-6.33-4.65-15.175-6.124-15.175-6.124l-93.876.613s-14.09.394-19.267 6.521c-4.606 5.455-.368 16.725-.368 16.725s73.49 171.942 156.711 258.592c76.315 79.454 162.958 74.239 162.958 74.239" fill="#fff"/></>;

/**
 * Contains the WeChat icon for the popular chinese platform
 * @param props the props for we chat icon
 * @returns a WeChat icon
 */
export function WeChatIcon(props: { className?: string }) {
  return (
    <SvgIcon viewBox="-40 -40 380 380" className={props.className}>
      {wechatsrc}
    </SvgIcon>
  )
}

/**
 * Contains the VK icon for the popular russian platform
 * @param props the props for the vk icon
 * @returns a WeChat icon
 */
export function VKIcon(props: { className?: string }) {
  return (
    <SvgIcon viewBox="-93 -93 1210 1210" className={props.className}>
      {vksrc}
    </SvgIcon>
  )
}
