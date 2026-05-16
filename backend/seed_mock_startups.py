import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Ensure we load the environment variables from .env.local before config initializes
load_dotenv(".env.local")

from database import get_supabase_client
from config import get_settings

def seed_startups():
    settings = get_settings()
    supabase = get_supabase_client()
    
    # Configure Gemini Client
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    mock_startups = [
        {
            "company_name": "EcoLogix Malaysia",
            "industry": "GreenTech",
            "stage": "Seed",
            "verification_status": "Pending",
            "growth_metrics": {"mrr": 5000, "active_users": 150},
            "total_funding": 250000.00,
            "_needs_text": "EcoLogix Malaysia is fundamentally transforming how agricultural supply chains operate by introducing an AI-powered tracing mechanism that ensures sustainability from farm to table. As we scale our operations across Southeast Asia, we are encountering significant hurdles in navigating the complex and ever-changing ESG compliance regulations specific to different jurisdictions. We are actively seeking an experienced mentor who possesses a deep understanding of B2B enterprise sales cycles and regulatory frameworks. Ideally, this mentor can guide us in structuring our compliance reporting to meet international standards and help us refine our pitch to enterprise clients who prioritize sustainable procurement. We also need strategic advice on building long-term partnerships with major agricultural conglomerates."
        },
        {
            "company_name": "HealthAI Innovations",
            "industry": "HealthTech",
            "stage": "Pre-Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 0, "active_users": 0},
            "total_funding": 50000.00,
            "_needs_text": "HealthAI Innovations is at the forefront of revolutionizing primary care in Malaysia by developing an advanced, AI-driven triage system designed specifically for local and rural clinics. Our core challenge right now involves optimizing our cloud infrastructure to handle sensitive patient data securely while scaling our AI inference models without incurring prohibitive computational costs. We are urgently looking for an AWS expert or a seasoned technical mentor who has hands-on experience in scaling healthcare applications. We need actionable advice on cloud architecture, HIPAA/PDPA compliance for data storage, and efficient model deployment strategies. A mentor with a strong background in medical software architecture and infrastructure optimization would be an invaluable asset to our engineering team."
        },
        {
            "company_name": "PayHalal",
            "industry": "FinTech",
            "stage": "Series A",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 20000, "active_users": 5000},
            "total_funding": 1500000.00,
            "_needs_text": "PayHalal is building the next generation of Shariah-compliant payment gateways, empowering Muslim consumers and businesses with ethical financial transactions. Having successfully captured a significant market share in Malaysia and secured our Series A funding, our immediate strategic goal is international expansion, specifically targeting the booming Indonesian market. We are seeking seasoned advisors who have successfully navigated cross-border expansion in Southeast Asia. We need deep insights into Bank Indonesia's regulatory requirements, establishing local partnerships, and adapting our product for a new demographic. Furthermore, we are looking for a mentor with a strong Venture Capital network who can guide us in preparing our financial models, pitch deck, and go-to-market strategy for an upcoming Series B fundraising round."
        },
        {
            "company_name": "LearnSphere",
            "industry": "EdTech",
            "stage": "Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 2000, "active_users": 1000},
            "total_funding": 300000.00,
            "_needs_text": "LearnSphere is a rapidly growing gamified learning platform tailored for K-12 students, aiming to make education highly engaging and accessible across Malaysia. While our user base is expanding organically, we recognize that true scale requires integration with the public school system. We are facing challenges in navigating public policy, bureaucratic processes, and securing crucial government grants. We are looking for a mentor with extensive experience in the EdTech sector, particularly someone who has successfully partnered with the Ministry of Education or similar government bodies. We need guidance on public procurement processes, aligning our curriculum with national standards, and structuring pilot programs that demonstrate clear educational outcomes to secure long-term government contracts and institutional support."
        },
        {
            "company_name": "LogisChain",
            "industry": "Web3 / Logistics",
            "stage": "Pre-Seed",
            "verification_status": "Pending",
            "growth_metrics": {"mrr": 0, "active_users": 10},
            "total_funding": 20000.00,
            "_needs_text": "LogisChain is pioneering a blockchain-based bill of lading platform designed to eliminate fraud, reduce paperwork, and streamline international shipping logistics. As a pre-seed startup founded by domain experts in supply chain management, our primary bottleneck is a lack of deep technical expertise in Web3 infrastructure. We are actively searching for a technical co-founder or a highly experienced technical mentor who can provide architectural guidance. We specifically need advice on writing secure, auditable smart contracts on the Ethereum network, selecting the right Layer 2 scaling solutions to minimize gas fees, and ensuring our platform meets enterprise-grade security standards. A mentor with a proven track record in DeFi or enterprise blockchain development would be a perfect match."
        },
        {
            "company_name": "DefendMY",
            "industry": "Cybersecurity",
            "stage": "Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 12000, "active_users": 20},
            "total_funding": 400000.00,
            "_needs_text": "DefendMY provides an automated, continuous B2B penetration testing platform that helps enterprises identify and remediate vulnerabilities before they can be exploited. While our technology is robust, we are struggling to penetrate the highly lucrative but notoriously closed-off banking and financial services sector. We are seeking a mentor with a strong background in cybersecurity sales, preferably a former CISO or an executive with deep connections in the financial industry. We need strategic advice on navigating the complex vendor risk assessment processes required by banks. Additionally, we are looking for guidance on achieving SOC2 and ISO 27001 compliance, as these certifications are strict prerequisites for landing enterprise contracts and building trust with highly regulated financial institutions."
        },
        {
            "company_name": "TalentMatch AI",
            "industry": "HR Tech",
            "stage": "Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 4500, "active_users": 300},
            "total_funding": 150000.00,
            "_needs_text": "TalentMatch AI is an innovative HR technology startup that leverages machine learning to provide intelligent resume screening tailored specifically for Small and Medium Enterprises (SMEs). We are currently in our seed stage and have achieved early product-market fit, but our customer acquisition cost remains unsustainably high. We are urgently looking for a mentor who is an expert in growth hacking, B2B SaaS marketing, and pricing strategy. We need actionable advice on optimizing our sales funnel, implementing viral loops for user acquisition, and structuring our subscription tiers to maximize customer lifetime value. A mentor who has successfully scaled a B2B SaaS product from early revenue to profitability would provide the exact guidance we need right now."
        },
        {
            "company_name": "CreatorHouse",
            "industry": "Media / Creator Economy",
            "stage": "Pre-Seed",
            "verification_status": "Pending",
            "growth_metrics": {"mrr": 500, "active_users": 50},
            "total_funding": 10000.00,
            "_needs_text": "CreatorHouse is a monetization platform dedicated to empowering micro-influencers and independent creators to build sustainable businesses from their content. We are currently in the pre-seed stage and are intensely focused on building a vibrant, highly engaged community of early adopters. We are seeking a mentor with deep expertise in consumer social platforms, community building, and the mechanics of the creator economy. We need strategic advice on implementing viral marketing campaigns, establishing effective retention loops, and designing features that encourage continuous engagement. Furthermore, we are looking for guidance on structuring brand partnerships and creating a compelling value proposition that attracts both creators and advertisers to our platform, ensuring a strong two-sided marketplace."
        },
        {
            "company_name": "AgriSense",
            "industry": "AgriTech",
            "stage": "Series A",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 50000, "active_users": 200},
            "total_funding": 2000000.00,
            "_needs_text": "AgriSense is deploying advanced IoT sensors across palm oil plantations to optimize yield, monitor soil health, and reduce environmental impact. Having secured our Series A funding, we are aggressively scaling our operations but are hitting significant bottlenecks in our hardware supply chain and distribution network. We are looking for a mentor with extensive experience in hardware manufacturing, particularly in transitioning from low-volume prototypes to mass production in Shenzhen or similar hubs. Additionally, we need strategic advice on expanding our distribution network into deep rural areas, managing logistics, and establishing reliable maintenance protocols for our IoT devices deployed in harsh agricultural environments. A mentor with ties to major agricultural conglomerates like Felda would be highly valuable."
        },
        {
            "company_name": "MedScan Co.",
            "industry": "HealthTech",
            "stage": "Seed",
            "verification_status": "Pending",
            "growth_metrics": {"mrr": 0, "active_users": 5},
            "total_funding": 800000.00,
            "_needs_text": "MedScan Co. is developing a highly affordable, portable ultrasound device integrated with AI diagnostics, specifically designed to empower healthcare workers in remote and underserved areas. We are in the seed stage and facing the monumental challenge of navigating the complex regulatory landscape for medical devices. We are seeking a mentor with deep expertise in HealthTech and regulatory affairs. We urgently need guidance on designing and executing clinical trials that meet rigorous international standards. Furthermore, we require strategic advice on obtaining necessary approvals from the Medical Device Authority (MDA) in Malaysia and eventually the FDA. A mentor who has successfully brought a Class II or Class III medical device to market would be an incredible asset."
        },
        {
            "company_name": "SkyDrop Malaysia",
            "industry": "Logistics / DroneTech",
            "stage": "Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 3000, "active_users": 15},
            "total_funding": 500000.00,
            "_needs_text": "SkyDrop Malaysia is pioneering last-mile drone delivery solutions specifically optimized for transporting critical medical supplies, blood samples, and vaccines to remote clinics and hospitals. While our drone technology and flight control software are highly advanced, our biggest hurdle lies in regulatory compliance and airspace management. We are seeking a mentor with extensive experience in aviation, logistics, and dealing with government regulatory bodies. We specifically need strategic advice on navigating the stringent regulations set by the Civil Aviation Authority of Malaysia (CAAM) to secure commercial flight permits. Furthermore, we are looking for guidance on optimizing our logistical operations, managing a drone fleet at scale, and building strategic partnerships with major public and private healthcare providers."
        },
        {
            "company_name": "ShopSight",
            "industry": "Retail Tech",
            "stage": "Pre-Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 1000, "active_users": 30},
            "total_funding": 60000.00,
            "_needs_text": "ShopSight leverages cutting-edge computer vision and AI analytics to provide brick-and-mortar retailers with the same level of granular customer behavior data that e-commerce stores enjoy. We are currently in the pre-seed stage and need to validate our technology through high-profile pilot programs. We are actively seeking a mentor who has deep connections within the retail industry, specifically someone who can facilitate introductions to major retail mall operators and large chain stores in Southeast Asia. We also need strategic advice on refining our product offering to focus on actionable O2O (Online-to-Offline) customer experience improvements, optimizing our hardware deployment strategy within physical stores, and pricing our SaaS analytics dashboard for enterprise retail clients."
        },
        {
            "company_name": "Lepak App",
            "industry": "Consumer Social",
            "stage": "Seed",
            "verification_status": "Pending",
            "growth_metrics": {"mrr": 0, "active_users": 15000},
            "total_funding": 100000.00,
            "_needs_text": "Lepak App is a hyperlocal social discovery application designed to connect foodies and facilitate spontaneous meetups at local eateries and hawker centers. We have gained significant initial traction and a passionate early user base, but we are struggling to maintain daily active user engagement and monetize the platform effectively. We are looking for a mentor who is a veteran in the consumer social space, preferably someone who has helped scale a social app to millions of users. We need deep insights into user psychology, establishing robust retention loops, and implementing non-intrusive monetization strategies. We are also seeking advice on viral growth mechanics to drastically reduce our customer acquisition cost and achieve organic, exponential user growth."
        },
        {
            "company_name": "SmartTaman",
            "industry": "PropTech",
            "stage": "Series A",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 35000, "active_users": 120},
            "total_funding": 1200000.00,
            "_needs_text": "SmartTaman provides comprehensive residential community management software that digitizes visitor management, facility booking, and security protocols for gated communities and condominiums. Having achieved Series A funding, we are looking to aggressively expand our market share by targeting large-scale property developers. We are seeking a mentor with extensive experience in PropTech and enterprise real estate sales. We need strategic guidance on navigating long sales cycles, negotiating complex contracts with property management corporations, and integrating our software into broader smart city initiatives. A mentor who can help us refine our enterprise pitch deck, optimize our sales funnel, and introduce us to key decision-makers within top-tier property development firms would dramatically accelerate our growth trajectory."
        },
        {
            "company_name": "Myths Studio",
            "industry": "GameFi",
            "stage": "Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 8000, "active_users": 1200},
            "total_funding": 400000.00,
            "_needs_text": "Myths Studio is an ambitious GameFi startup currently developing an immersive, AR-based mobile RPG that integrates blockchain technology and verifiable asset ownership. We have a talented art and design team but lack deep technical expertise in complex game engine optimization and Web3 economics. We are urgently seeking a mentor who is an expert in Unity development and AR implementation for mobile platforms. Furthermore, we need strategic advice on GameFi tokenomics, specifically designing a balanced, sustainable in-game economy that avoids the typical hyper-inflationary pitfalls of play-to-earn models. We are also looking for a mentor who has strong connections to major gaming publishers and Web3 venture capitalists to help us secure our next round of funding."
        },
        {
            "company_name": "NasiLemak.io",
            "industry": "FoodTech",
            "stage": "Pre-Seed",
            "verification_status": "Pending",
            "growth_metrics": {"mrr": 200, "active_users": 100},
            "total_funding": 15000.00,
            "_needs_text": "NasiLemak.io operates a rapidly growing network of cloud kitchens and serves as an aggregator platform specifically designed to help local hawkers and traditional food stalls digitize their operations and reach a wider delivery radius. We are in the pre-seed stage and are currently facing significant challenges related to operational efficiency, managing food delivery logistics, and maintaining healthy profit margins in a highly competitive market. We are seeking a mentor with deep operational expertise in the FoodTech or logistics sector. We need actionable advice on optimizing kitchen workflows, reducing food waste, negotiating better rates with third-party delivery fleets, and implementing data-driven strategies to maximize the profitability of our partner hawkers while keeping consumer prices affordable."
        },
        {
            "company_name": "CutiCuti Tech",
            "industry": "TravelTech",
            "stage": "Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 15000, "active_users": 2000},
            "total_funding": 300000.00,
            "_needs_text": "CutiCuti Tech is building an AI-powered itinerary planner and booking aggregator designed specifically to cater to inbound tourists visiting Malaysia, offering personalized, culturally immersive travel experiences. We have a working MVP but are struggling to scale our user acquisition and establish trust in key international markets. We are actively seeking a mentor with extensive experience in TravelTech and international digital marketing. We need strategic guidance on establishing official partnerships with local state tourism boards, hotels, and airlines. Furthermore, we are looking for advice on optimizing our SEO strategy, running targeted marketing campaigns in countries like China and the Middle East, and improving our conversion rates to drive significant booking volume through our platform."
        },
        {
            "company_name": "SolarBumbung",
            "industry": "GreenTech",
            "stage": "Series A",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 80000, "active_users": 50},
            "total_funding": 2500000.00,
            "_needs_text": "SolarBumbung is a GreenTech startup on a mission to democratize renewable energy by offering innovative, zero-upfront-cost solar panel leasing models specifically targeted at B40 (lower-income) households in Malaysia. Having secured our Series A, our biggest challenge is scaling our financing structure to support mass deployment. We are urgently seeking a mentor with deep expertise in structured finance, project financing, and raising debt facilities. We need strategic advice on securitizing our leases, negotiating with commercial banks, and navigating complex national renewable energy policies and subsidies. A mentor who understands the intersection of clean energy, financial engineering, and government relations will be crucial in helping us transition from a startup to a major national utility provider."
        },
        {
            "company_name": "BorakBot",
            "industry": "AI",
            "stage": "Seed",
            "verification_status": "Pending",
            "growth_metrics": {"mrr": 4000, "active_users": 80},
            "total_funding": 150000.00,
            "_needs_text": "BorakBot is developing specialized, localized LLM wrappers and AI chatbots specifically trained on Manglish, Bahasa Melayu, and local dialects to provide hyper-contextualized automated customer service for Malaysian businesses. We are in the seed stage and are hitting technical limitations with our current fine-tuning approaches. We are seeking a highly technical mentor with deep expertise in Artificial Intelligence, Natural Language Processing (NLP), and large language models. We need actionable advice on optimizing our fine-tuning pipelines, reducing hallucination rates in localized contexts, and deploying these models efficiently to keep API costs manageable. Furthermore, we are looking for strategic guidance on positioning our B2B offering against generic international AI tools to capture the local enterprise market."
        },
        {
            "company_name": "PasarB2B",
            "industry": "E-commerce",
            "stage": "Seed",
            "verification_status": "Verified",
            "growth_metrics": {"mrr": 25000, "active_users": 400},
            "total_funding": 600000.00,
            "_needs_text": "PasarB2B is a rapidly scaling B2B marketplace designed to digitize the wholesale grocery supply chain, connecting mom-and-pop shops directly with major FMCG distributors and manufacturers. While we have secured our seed funding and proven our core business model, our rapid growth is putting immense strain on our logistics and working capital. We are actively seeking a mentor with deep operational expertise in supply chain optimization, warehousing, and B2B e-commerce. We urgently need strategic advice on streamlining our fulfillment centers, reducing delivery lead times, and implementing robust inventory management systems. Additionally, we are looking for guidance on structuring and securing trade financing facilities to offer better credit terms to our buyers without constraining our cash flow."
        }
    ]

    print("🚀 Starting startup seed process with Gemini Embeddings...")
    
    for startup in mock_startups:
        print(f"Generating embedding for {startup['company_name']}...")
        
        # Extract the text to embed
        embedding_text = startup.pop("_needs_text")
        
        response = client.models.embed_content(
            model="gemini-embedding-2-preview",
            contents=embedding_text,
            config=types.EmbedContentConfig(
                task_type="SEMANTIC_SIMILARITY",
                output_dimensionality=768
            )
        )
        
        # Attach the 768-dimensional pgvector array to the startup object
        startup["needs_embedding"] = response.embeddings[0].values
        
        # Insert into Supabase (id is auto-generated)
        print(f"Inserting {startup['company_name']} into Supabase...")
        try:
            supabase.table("startups").insert(startup).execute()
            print(f"✅ Successfully added {startup['company_name']}.")
        except Exception as e:
            print(f"❌ Failed to insert {startup['company_name']}: {str(e)}")
            
    print("\n🎉 Seeding complete! The 'startups' table is now populated.")

if __name__ == "__main__":
    seed_startups()
