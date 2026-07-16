import { AboutSection } from '../about/AboutSection'
import { CtaBanner } from '../contact/ContactPage'
import { ListingsSection } from '../listings/ListingsSection'
import { ResourcesSection } from '../resources/ResourcesSection'
import { Hero } from './Hero'
import { Stats } from './Stats'

export function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <ListingsSection />
      <AboutSection />
      <ResourcesSection />
      <CtaBanner />
    </>
  )
}
