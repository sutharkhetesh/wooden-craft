import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDown,
  MoveRight,
  Leaf,
  Ruler,
  HandHeart,
  Sparkles,
  Star,
} from "lucide-react";
import { Photo, TextLink, ProjectCTA } from "@/components/shared";
import { Reveal } from "@/components/reveal";
import { services, projects } from "@/lib/data";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
const process = [
  [
    "01",
    "Share your idea",
    "A sketch, a reference, or simply a thought. Every good piece starts with a conversation.",
  ],
  [
    "02",
    "Make it your own",
    "Together, we explore proportions, materials and finishes that feel right for you.",
  ],
  [
    "03",
    "Know every detail",
    "Receive a considered proposal with a clear scope, quotation and expected timeline.",
  ],
  [
    "04",
    "Watch it come to life",
    "From the first cut to the final installation, your vision takes shape with care.",
  ],
];
export default function Home() {
  return (
    <>
      <section className="hero">
        <Photo
          name="hero"
          alt="Warm, sunlit living room with natural wooden furniture and linen seating"
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="wrap hero-content">
          <Reveal>
            <p className="eyebrow">
              <span className="tiny-line" /> NATURAL WOOD. EXTRAORDINARY
              POSSIBILITIES.
            </p>
            <h1>
              Crafted from wood.
              <br />
              Designed <em>for you.</em>
            </h1>
            <p className="hero-description">
              Beautifully handcrafted wooden furniture and bespoke interiors,
              <br className="desktop-break" /> tailored to your space, style,
              and vision.
            </p>
            <div className="hero-actions">
              <Link href="/enquiry" className="button button-light">
                Request a custom quote
                <ArrowUpRight size={17} />
              </Link>
              <Link href="/work" className="hero-work">
                Explore our work
                <MoveRight size={20} />
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="hero-bottom wrap">
          <a href="#story">
            <ArrowDown size={14} /> SCROLL TO DISCOVER
          </a>
          <span>MADE WITH INTENTION. MADE FOR LIVING.</span>
          <span className="hero-count">
            01 <i /> 04
          </span>
        </div>
      </section>
      <div className="values-strip">
        <span>
          <Leaf size={15} /> HONEST MATERIALS
        </span>
        <i />
        <span>
          <Ruler size={15} /> MADE TO MEASURE
        </span>
        <i />
        <span>
          <HandHeart size={15} /> CRAFTED WITH CARE
        </span>
        <i />
        <span>
          <Sparkles size={15} /> TIMELESS BY DESIGN
        </span>
      </div>
      <section className="wrap story-section" id="story">
        <Reveal className="story-images">
          <Photo
            name="detail"
            alt="Natural timber furniture and the warmth of a carefully finished wood grain"
          />
          <div className="image-note">
            <span>
              GOOD DESIGN BEGINS
              <br />
              WITH GOOD MATERIALS.
            </span>
            <Leaf size={27} />
          </div>
          <span className="photo-caption">THE BEAUTY IS IN THE DETAILS.</span>
        </Reveal>
        <Reveal className="story-copy">
          <p className="eyebrow">THE GRAIN & FORM PHILOSOPHY</p>
          <h2>
            More than furniture.
            <br />
            <em>A part of your story.</em>
          </h2>
          <p>
            Some pieces do more than fill a room. They hold everyday moments,
            reflect who you are, and feel like they’ve always belonged.
          </p>
          <p>
            We bring thoughtful design and honest craftsmanship together to
            create wooden furniture and interiors around the way you live. Every
            grain, every joint, every finish — considered.
          </p>
          <TextLink href="/about">Discover our story</TextLink>
          <div className="story-signature">
            Made thoughtfully. Made for you.
          </div>
        </Reveal>
      </section>
      <section className="expertise-section">
        <div className="wrap">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">WHAT WE CREATE</p>
              <h2>
                Your vision.
                <br />
                <em>Our expertise.</em>
              </h2>
            </div>
            <div>
              <p>
                From a single statement piece to a complete space,
                <br />
                we bring warmth and purpose to every corner.
              </p>
              <TextLink href="/services">Explore all services</TextLink>
            </div>
          </Reveal>
          <div className="service-grid">
            {services.slice(0, 3).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08} interactive>
                <article className="service-card">
                  <Link href={`/services#${s.id}`} className="service-photo">
                    <Photo name={s.image} alt={s.name} />
                    <span className="round-arrow">
                      <ArrowUpRight size={21} />
                    </span>
                  </Link>
                  <div className="service-info">
                    <span className="card-index">0{i + 1}</span>
                    <div>
                      <h3>
                        <Link href={`/services#${s.id}`}>{s.name}</Link>
                      </h3>
                      <p>{s.tag}</p>
                      <Link
                        href={`/enquiry?type=${encodeURIComponent(s.type)}`}
                        className="small-link"
                      >
                        Send enquiry <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="collection-featured">
        <div className="wrap">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">OBJECTS FOR THE EVERYDAY</p>
              <h2>
                Little rituals.
                <br />
                <em>Beautifully considered.</em>
              </h2>
            </div>
            <div>
              <p>
                Wooden pieces for a desk, a reading corner, or a thoughtful
                gift.
              </p>
              <TextLink href="/products">Explore the collection</TextLink>
            </div>
          </Reveal>
          <div className="collection-grid">
            {products.slice(0, 3).map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="wrap process-section">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">A COLLABORATIVE JOURNEY</p>
            <h2>
              From a thought.
              <br />
              <em>To something tangible.</em>
            </h2>
          </div>
          <p>
            A simple, personal process.
            <br />
            With you, at every step.
          </p>
        </Reveal>
        <div className="process-grid">
          {process.map(([n, title, desc], i) => (
            <Reveal key={n} delay={i * 0.08}>
              <div className="process-number">
                {n}
                <span />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="work-section">
        <div className="wrap">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">A FEW POSSIBILITIES</p>
              <h2>
                Spaces with soul.
                <br />
                <em>Pieces with purpose.</em>
              </h2>
            </div>
            <div>
              <p>A glimpse of what thoughtful woodwork can become.</p>
              <TextLink href="/work">View selected work</TextLink>
            </div>
          </Reveal>
          <div className="featured-grid">
            {projects.slice(0, 2).map((p, i) => (
              <Reveal key={p.slug} className={i ? "featured-secondary" : ""}>
                <Link href={`/work/${p.slug}`} className="project-image">
                  <Photo name={p.image} alt={p.name} />
                  <span className="project-overlay">
                    Explore this concept <ArrowUpRight size={22} />
                  </span>
                </Link>
                <div className="project-title">
                  <div>
                    <span className="eyebrow">
                      {p.category} <span className="demo-tag">CONCEPT</span>
                    </span>
                    <h3>
                      <Link href={`/work/${p.slug}`}>{p.name}</Link>
                    </h3>
                  </div>
                  <Link href={`/work/${p.slug}`} aria-label={`View ${p.name}`}>
                    <ArrowUpRight size={23} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="demo-note">
            Illustrative portfolio concepts. Imagine the possibilities for your
            own space.
          </p>
        </div>
      </section>
      <section className="why-section wrap">
        <Photo name="craft" alt="Hands-on craftsmanship in a wood workshop" />
        <Reveal className="why-copy">
          <p className="eyebrow">THE DIFFERENCE IS IN THE MAKING</p>
          <h2>
            Considered design.
            <br />
            <em>Uncompromising care.</em>
          </h2>
          <p>
            Beautiful woodwork is the sum of a thousand small decisions. Here’s
            what guides ours.
          </p>
          {[
            [
              "Made around you",
              "Custom dimensions and details, shaped by your space and the way you live.",
            ],
            [
              "Materials with character",
              "Carefully selected timber and finishes that let natural beauty speak.",
            ],
            [
              "Care in every detail",
              "Skilled craftsmanship, thoughtful joinery and a personal design conversation.",
            ],
          ].map(([title, desc], i) => (
            <div className="why-item" key={title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>
      <section className="testimonials">
        <div className="wrap">
          <p className="eyebrow">
            THE KIND OF EXPERIENCE WE STRIVE FOR · DEMO REVIEWS
          </p>
          <Reveal>
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <blockquote>
              “A piece that feels like it was always meant
              <br className="desktop-break" /> to be in our home. Beautiful, in
              every detail.”
            </blockquote>
            <p className="review-author">
              AN ILLUSTRATIVE CLIENT STORY{" "}
              <span>Custom dining furniture · Demo content</span>
            </p>
          </Reveal>
        </div>
      </section>
      <ProjectCTA />
    </>
  );
}
