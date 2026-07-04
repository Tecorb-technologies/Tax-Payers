import { BrowserRouter, Route, Routes } from "react-router-dom"

import Layout from "@/components/Layout"
import HomePage from "@/pages/HomePage"
import AreaPage from "@/pages/AreaPage"
import ProjectPage from "@/pages/ProjectPage"
import SettingsPage from "@/pages/SettingsPage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="areas/:id" element={<AreaPage />} />
          <Route path="projects/:id" element={<ProjectPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
