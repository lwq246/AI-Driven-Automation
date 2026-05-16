import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Ensure we load the environment variables from .env.local before config initializes
load_dotenv(".env.local")

from database import get_supabase_client
from config import get_settings
def seed_mentors():
    settings = get_settings()
    supabase = get_supabase_client()
    
    # Configure Gemini
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    mock_mentors = [
        {
            "name": "Sarah Lim",
            "expertise_skills": ["Enterprise Sales", "B2B SaaS", "Go-To-Market"],
            "bio": "Sarah Lim is an accomplished Go-To-Market and Enterprise Sales executive with over 15 years of deep experience in the B2B SaaS space across Southeast Asia. She previously served as the VP of Sales at TechCorp, where she spearheaded market penetration strategies that successfully scaled three distinct Malaysian startups from early seed stage through their Series B funding rounds. Her core expertise lies in navigating notoriously long, complex sales cycles and expertly closing large-scale, multi-million ringgit contracts with government agencies and top-tier enterprise conglomerates. Sarah is highly passionate about mentoring early-stage founders who are transitioning from product-led growth to building robust, quota-carrying enterprise sales teams, helping them establish repeatable, scalable, and highly predictable revenue engines.",
            "years_experience": 15,
            "avg_success_score": 92.5
        },
        {
            "name": "Khairul Anwar",
            "expertise_skills": ["Cloud Architecture", "AWS", "AI Infrastructure", "DevOps"],
            "bio": "Khairul Anwar brings a decade of highly specialized technical experience as a former Senior Solutions Architect at Amazon Web Services (AWS). Throughout his tenure, he has partnered with dozens of high-growth startups to design, build, and optimize scalable, highly resilient cloud architectures. His primary focus is on constructing robust backend infrastructure specifically tailored for AI-native applications, ensuring they can handle massive data loads and complex inference tasks without latency bottlenecks. Khairul excels in guiding technical founders through complex DevOps implementations, establishing CI/CD pipelines, and executing rigorous cost-optimization strategies to dramatically reduce cloud spend. He is particularly effective at helping startups migrate from monolithic structures to microservices, ensuring they are enterprise-ready and built to scale.",
            "years_experience": 10,
            "avg_success_score": 88.0
        },
        {
            "name": "Dr. Azmi Rahman",
            "expertise_skills": ["ESG Compliance", "Supply Chain", "Sustainability"],
            "bio": "Dr. Azmi Rahman is a renowned academic turned highly sought-after industry consultant with over 20 years of experience specializing in Environmental, Social, and Governance (ESG) compliance and sustainable supply chain management. He is a leading authority on navigating the complex, rapidly evolving landscape of international sustainability standards. Dr. Azmi actively advises hardware and manufacturing startups on implementing comprehensive, data-driven ESG frameworks that are strictly required to secure coveted European export grants and comply with international trade regulations. His mentorship is invaluable for founders looking to transform sustainability from a mere compliance checkbox into a core, highly defensible competitive advantage, significantly appealing to impact-focused venture capitalists and global institutional investors looking for ethical supply chains.",
            "years_experience": 20,
            "avg_success_score": 95.0
        },
        {
            "name": "Jane Doe",
            "expertise_skills": ["FinTech", "Payment Gateways", "Series A Funding"],
            "bio": "Jane Doe is a formidable figure in the regional FinTech landscape, bringing 18 years of invaluable experience as the former regional head of a major international payment gateway. She possesses an unparalleled, nuanced understanding of the complex regulatory environment in Malaysia, including extensive experience directly navigating Bank Negara Malaysia (BNM) frameworks and compliance protocols. Beyond regulatory expertise, Jane is a master at structuring startups for institutional investment. She has successfully mentored numerous early-stage FinTech founders through the grueling process of securing Series A and Series B funding, leveraging her deep network of regional Venture Capitalists. Her guidance is critical for startups looking to expand their operations cross-border while maintaining strict compliance with local financial authorities.",
            "years_experience": 18,
            "avg_success_score": 90.0
        },
        {
            "name": "Michael Chong",
            "expertise_skills": ["Marketing", "Growth Hacking", "E-commerce"],
            "bio": "Michael Chong is a visionary growth marketer and former Chief Marketing Officer of a top-tier Southeast Asian e-commerce platform. With 12 years of aggressive, hands-on experience, he is an absolute master of high-velocity user acquisition, intricate Customer Acquisition Cost (CAC) optimization, and building powerful, long-term retention strategies. Michael's expertise lies in moving beyond traditional marketing to implement highly technical growth hacking frameworks, utilizing deep data analytics and A/B testing to identify and exploit viral growth loops. He excels in mentoring B2C and consumer-focused startups that are struggling to break through the noise, providing them with actionable, data-driven playbooks to rapidly scale their user base, optimize their conversion funnels, and significantly increase customer lifetime value.",
            "years_experience": 12,
            "avg_success_score": 89.5
        },
        {
            "name": "Siti Nurhaliza",
            "expertise_skills": ["EdTech", "Public Policy", "Government Grants"],
            "bio": "Siti Nurhaliza leverages 14 years of invaluable experience as a former senior civil servant within the Malaysian Ministry of Education. Her profound understanding of public policy, government procurement cycles, and institutional bureaucracy makes her an indispensable mentor for EdTech and B2G (Business-to-Government) startups. She is highly experienced in guiding founders through the complex, often opaque processes required to secure significant government grants, including the Cradle CIP funds and various state-level innovation initiatives. Siti provides critical strategic advice on aligning startup product roadmaps with national educational agendas, drafting compelling grant proposals, and establishing lucrative, long-term pilot programs with public schools and universities, effectively bridging the gap between agile tech startups and traditional government institutions.",
            "years_experience": 14,
            "avg_success_score": 93.0
        },
        {
            "name": "Wei Jie",
            "expertise_skills": ["Web3", "Blockchain", "Smart Contracts", "DeFi"],
            "bio": "Wei Jie is a highly respected Lead Blockchain Developer who has architected and deployed multiple successful Decentralized Finance (DeFi) protocols handling millions in Total Value Locked (TVL). With 8 years of deep technical immersion in the Web3 space, he is a foremost expert in Solidity smart contract development, rigorous security auditing, and designing sustainable, non-inflationary tokenomics models. Wei Jie is passionate about mentoring technical co-founders who are transitioning from Web2 to Web3, providing hands-on guidance in building secure, decentralized infrastructure that is resilient against exploits. His mentorship is crucial for startups looking to navigate the complex technical and economic nuances of launching a token, integrating with Layer 2 scaling solutions, and building trustless, transparent applications.",
            "years_experience": 8,
            "avg_success_score": 85.5
        },
        {
            "name": "Aiman Yusof",
            "expertise_skills": ["Cybersecurity", "Penetration Testing", "Compliance", "SOC2"],
            "bio": "Aiman Yusof is a veteran Chief Information Security Officer (CISO) at a leading regional bank, bringing 22 years of elite experience in enterprise cybersecurity, threat intelligence, and stringent regulatory compliance. He specializes in mentoring B2B SaaS and FinTech startups on the critical task of establishing robust, enterprise-grade security protocols from day one. Aiman provides highly actionable roadmaps for achieving complex certifications like SOC2 Type II and ISO 27001, which are absolute prerequisites for closing deals with highly regulated industries. He guides technical teams through rigorous penetration testing, secure coding practices, and successfully passing the grueling vendor risk assessments required by banks, effectively turning a startup's security posture into a powerful sales enabler.",
            "years_experience": 22,
            "avg_success_score": 96.0
        },
        {
            "name": "Kavitha Nair",
            "expertise_skills": ["HR Tech", "Talent Acquisition", "Culture Building"],
            "bio": "Kavitha Nair is the former Head of People at Grab, where she played a pivotal role in scaling the organization through its hyper-growth phase. With 16 years of deep HR Tech and talent acquisition experience, she specializes in helping early-stage founders transition from a small, scrappy founding team to a structured, high-performance corporate organization. Kavitha provides expert guidance on establishing highly effective hiring pipelines, designing competitive compensation frameworks, and most importantly, intentionally engineering a strong, resilient company culture that attracts and retains top-tier engineering and executive talent. Her mentorship is crucial for startups facing the chaotic organizational challenges of scaling rapidly, ensuring they build a strong foundation of leadership and employee engagement.",
            "years_experience": 16,
            "avg_success_score": 91.0
        },
        {
            "name": "David Tan",
            "expertise_skills": ["Venture Capital", "Term Sheets", "Pitching"],
            "bio": "David Tan is a highly influential Partner at a prominent regional Venture Capital firm, bringing 15 years of sharp expertise in startup investing, financial modeling, and complex deal structuring. He possesses an intimate, inside knowledge of exactly what institutional investors look for during aggressive fundraising rounds. David excels at mentoring early-stage founders on refining their pitch decks to create a compelling, data-driven narrative that resonates with top-tier VCs. Furthermore, he provides indispensable, tactical guidance on accurately valuing the company, navigating the intricate legal nuances of term sheet negotiations, and avoiding common pitfalls that can severely dilute founder equity. His mentorship is highly strategic, designed to prepare startups for successful Series A and Series B raises.",
            "years_experience": 15,
            "avg_success_score": 87.5
        },
        {
            "name": "Farid Kamil",
            "expertise_skills": ["IoT", "Hardware Manufacturing", "Prototyping"],
            "bio": "Farid Kamil is a veteran hardware engineer and supply chain expert with 19 years of profound experience, maintaining deep, strategic ties to the massive manufacturing hubs in Shenzhen and Penang. He is an invaluable mentor for hardware, IoT, and AgriTech startups that are facing the notoriously difficult 'valley of death' transition from creating a working prototype to executing reliable, high-quality mass production. Farid provides critical, hands-on guidance on DFM (Design for Manufacturing), aggressive component sourcing, negotiating favorable terms with highly competitive OEM/ODM factories, and establishing rigorous quality control protocols. His expertise helps founders significantly reduce manufacturing lead times, optimize their Bill of Materials (BOM) costs, and successfully deliver complex hardware products to the market.",
            "years_experience": 19,
            "avg_success_score": 94.0
        },
        {
            "name": "Nurul Ain",
            "expertise_skills": ["HealthTech", "Medical Devices", "Clinical Trials"],
            "bio": "Nurul Ain is a medical doctor turned successful HealthTech entrepreneur, possessing a unique, highly dual perspective on both clinical practice and agile startup innovation. With 11 years of experience, she expertly navigates the formidable, highly regulated landscape of medical devices and digital health solutions in Southeast Asia. She specializes in mentoring founders through the grueling process of securing vital approvals from the Medical Device Authority (MDA) in Malaysia and structuring complex, rigorous clinical validation trials. Nurul provides essential strategic advice on establishing crucial partnerships with major hospitals, communicating effectively with healthcare professionals, and ensuring that innovative HealthTech products meet the strict safety, efficacy, and compliance standards required for mass adoption in the medical sector.",
            "years_experience": 11,
            "avg_success_score": 86.0
        },
        {
            "name": "Jason Lee",
            "expertise_skills": ["AgriTech", "Drone Tech", "Rural Development"],
            "bio": "Jason Lee is a recognized pioneer in the deployment of precision agriculture and drone technology across Malaysia, boasting 13 years of on-the-ground, operational experience. He has established deep, highly strategic connections with major agricultural conglomerates like Felda and Sime Darby. Jason is an exceptional mentor for AgriTech startups looking to deploy IoT, drone mapping, and yield optimization software at a massive scale. He provides critical, practical guidance on navigating the complex logistics of rural deployment, building trust with traditional farm operators, and structuring high-value B2B pilot programs that demonstrate immediate, undeniable ROI. His mentorship bridges the gap between cutting-edge technological innovation and the practical, hard realities of the traditional Southeast Asian agricultural sector.",
            "years_experience": 13,
            "avg_success_score": 88.5
        },
        {
            "name": "Amirah Othman",
            "expertise_skills": ["Legal", "Intellectual Property", "Patents"],
            "bio": "Amirah Othman is a highly specialized corporate lawyer with 17 years of deep expertise focusing exclusively on intellectual property (IP), patent law, and tech-focused venture capital structures. She is an indispensable mentor for deeply technical, R&D-heavy startups aiming to aggressively protect their proprietary algorithms, hardware designs, and core innovations from regional competitors. Amirah provides expert, strategic guidance on filing defensible international patents, securing crucial trademarks, and navigating complex open-source licensing issues. Furthermore, she assists early-stage teams in drafting ironclad co-founder agreements, structuring employee stock option pools (ESOP), and ensuring the startup's legal foundation is meticulously structured to confidently pass the rigorous due diligence processes required by sophisticated institutional investors during major funding rounds.",
            "years_experience": 17,
            "avg_success_score": 92.0
        },
        {
            "name": "Samuel Wong",
            "expertise_skills": ["Data Science", "Machine Learning", "Predictive Analytics"],
            "bio": "Samuel Wong is a brilliant former Google Data Scientist who brings 9 years of elite, cutting-edge experience in machine learning, predictive analytics, and deploying massive-scale data pipelines. He is a highly technical mentor dedicated to helping AI and data-driven startups transition from using generic, off-the-shelf APIs to architecting and training highly defensible, proprietary machine learning models. Samuel excels in providing hands-on, architectural guidance on optimizing cloud data storage, establishing robust MLOps (Machine Learning Operations) frameworks, and dramatically reducing costly API dependencies. His mentorship is critical for startups looking to build an AI-first architecture that scales efficiently, minimizes hallucinations, and transforms their raw, unstructured data into a powerful, unassailable competitive advantage in the market.",
            "years_experience": 9,
            "avg_success_score": 84.5
        },
        {
            "name": "Farah Ann",
            "expertise_skills": ["Retail Tech", "O2O", "Customer Experience"],
            "bio": "Farah Ann is the former Vice President of Strategy for one of Southeast Asia's largest retail mall operators, bringing 14 years of unparalleled insight into the rapidly evolving landscape of physical retail and O2O (Online-to-Offline) commerce. She is an exceptional mentor for Retail Tech startups looking to integrate computer vision, POS software, or omnichannel analytics into traditional brick-and-mortar stores. Farah leverages her extensive, high-level corporate network to connect early-stage founders directly with key decision-makers at retail giants, facilitating crucial, high-visibility pilot projects and proof-of-concepts. She provides expert guidance on refining B2B enterprise pitches, understanding the specific pain points of legacy retail operations, and designing products that dramatically enhance the offline customer experience and drive foot traffic.",
            "years_experience": 14,
            "avg_success_score": 90.5
        },
        {
            "name": "Reza Razali",
            "expertise_skills": ["Logistics", "Last-Mile Delivery", "Operations"],
            "bio": "Reza Razali is a legendary operations guru who successfully scaled a prominent regional logistics player from zero deliveries to a highly successful IPO. With 21 years of gritty, hands-on experience, he is a master of complex fleet management, real-time route optimization, and the brutal realities of scaling unit economics. Reza is an invaluable mentor for startups operating in Logistics, E-commerce fulfillment, and FoodTech. He provides highly actionable, battle-tested advice on optimizing last-mile delivery networks, significantly reducing operational overhead, and navigating the complexities of managing a massive, decentralized gig-economy workforce. His mentorship is critical for operational-heavy startups looking to expand their geographic footprint rapidly without sacrificing service quality or bleeding cash on inefficient logistics networks.",
            "years_experience": 21,
            "avg_success_score": 97.0
        },
        {
            "name": "Rachel See",
            "expertise_skills": ["Consumer Social", "Community Building", "Viral Marketing"],
            "bio": "Rachel See is the brilliant community lead and viral growth architect behind one of Malaysia's most successful, widely downloaded consumer social applications. With 7 years of intense, hyper-focused experience, she teaches early-stage founders the intricate mechanics of building powerful network effects, designing addictive retention loops, and leveraging deep user psychology. Rachel is a highly strategic mentor for Consumer Social, Media, and Creator Economy startups that are struggling with high churn rates. She provides actionable, creative guidance on establishing authentic community engagement, launching zero-budget viral marketing campaigns, and designing product features that organically incentivize users to invite their friends, drastically lowering customer acquisition costs and driving exponential, highly sustainable organic growth.",
            "years_experience": 7,
            "avg_success_score": 83.0
        },
        {
            "name": "Tengku Haris",
            "expertise_skills": ["PropTech", "Real Estate", "Smart Cities"],
            "bio": "Tengku Haris is a highly influential Director at a leading, publicly listed property development firm, bringing 25 years of deep, authoritative experience in real estate, urban planning, and large-scale infrastructure projects. He is a deeply connected mentor for PropTech startups focused on smart home integrations, advanced property management software, and sustainable smart city solutions. Tengku Haris provides invaluable strategic guidance on navigating the notoriously long, complex enterprise sales cycles typical of the real estate industry. He helps founders refine their value proposition to appeal to massive corporate developers, optimize their B2B sales funnels, and secures high-level introductions to key decision-makers, significantly accelerating the adoption of innovative property technologies across major residential and commercial developments.",
            "years_experience": 25,
            "avg_success_score": 98.0
        },
        {
            "name": "Imran Khan",
            "expertise_skills": ["GameFi", "Unity", "AR/VR"],
            "bio": "Imran Khan is a veteran, highly respected game producer with 12 years of extensive experience navigating the global gaming industry, specifically focusing on mobile, AR/VR, and the rapidly emerging GameFi sector. He is an exceptional mentor for indie game studios and Web3 gaming startups struggling to balance complex tokenomics with genuinely engaging gameplay. Imran provides highly technical, hands-on guidance on optimizing Unity engine performance, refining core game loops to maximize player retention, and designing sustainable in-game economies that avoid the hyper-inflationary traps of early play-to-earn models. Furthermore, he leverages his deep industry connections to help startups navigate complex publishing deals, secure crucial distribution partnerships, and effectively pitch their projects to major international gaming venture capitalists.",
            "years_experience": 12,
            "avg_success_score": 86.5
        }
    ]

    print("🌱 Starting mentor seed process with Gemini Embeddings...")
    
    for mentor in mock_mentors:
        print(f"Generating embedding for {mentor['name']}...")
        
        # We create the embedding based on a combination of their bio and skills
        embedding_text = f"Skills: {', '.join(mentor['expertise_skills'])}. Bio: {mentor['bio']}"
        
        response = client.models.embed_content(
            model="gemini-embedding-2-preview",
            contents=embedding_text,
            config=types.EmbedContentConfig(
                task_type="SEMANTIC_SIMILARITY",
                output_dimensionality=768
            )
        )
        
        # Attach the 768-dimensional pgvector array to the mentor object
        mentor["skills_embedding"] = response.embeddings[0].values

        
        # Attach the 768-dimensional pgvector array to the mentor object
        mentor["skills_embedding"] = response.embeddings[0].values
        
        # Insert into Supabase (id is auto-generated)
        print(f"Inserting {mentor['name']} into Supabase...")
        try:
            supabase.table("mentors").insert(mentor).execute()
            print(f"✅ Successfully added {mentor['name']}.")
        except Exception as e:
            print(f"❌ Failed to insert {mentor['name']}: {str(e)}")
            
    print("\n🎉 Seeding complete! The 'mentors' table is now populated with Gemini AI vectors.")
    print("You can now test the /api/ai/match endpoint!")

if __name__ == "__main__":
    seed_mentors()
