import { Button } from '../ui/Button';

export const CTA = () => (
  <section className="py-24 bg-[#0f172a]">
    <div className="container mx-auto px-6">
      <div className="bg-secondary p-12 rounded-[3rem] text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to bridge the gap?</h2>
        <Button variant="secondary" size="lg">Request Demo</Button>
      </div>
    </div>
  </section>
);