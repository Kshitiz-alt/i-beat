import { ReactNode } from "react"

export interface Songg {
    name: string
    primaryArtists: ReactNode
    id:string
    image:{url:string}[]
    downloadUrl:{url:string}[]
}