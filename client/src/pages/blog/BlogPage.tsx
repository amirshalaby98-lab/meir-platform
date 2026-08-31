import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

const blogPosts = [
  {
    id: 'car-battery-signs',
    title: 'كيف تعرف إن بطارية سيارتك خربانة؟ 7 علامات واضحة',
    excerpt: 'تعرف على أهم العلامات التي تدل على ضعف أو تلف بطارية السيارة، ومتى يجب تغييرها قبل أن تتعطل في وقت غير مناسب.',
    date: '2024-12-15',
    readTime: '5 دقائق',
    category: 'بطاريات',
    image: '🔋'
  },
  {
    id: 'starter-alternator-symptoms',
    title: 'أعراض خراب السلف والدينمو - دليل شامل',
    excerpt: 'هل سيارتك ما تشتغل؟ تعرف على الفرق بين أعراض خراب السلف وخراب الدينمو وكيف تشخص المشكلة بنفسك.',
    date: '2024-12-10',
    readTime: '7 دقائق',
    category: 'سلف ودينمو',
    image: '⚙️'
  },
];

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title>مدونة مير - نصائح صيانة وتشخيص السيارات</title>
        <meta name="description" content="مدونة مير لصيانة السيارات - نصائح ومقالات متخصصة في تشخيص الأعطال، البطاريات، السلف والدينمو. تعلم كيف تحافظ على سيارتك." />
        <meta name="keywords" content="مدونة صيانة سيارات، نصائح سيارات، تشخيص أعطال سيارات، بطارية سيارة، سلف سيارة، دينمو سيارة" />
        <link rel="canonical" href="https://meirservic.co/blog" />
      </Helmet>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero */}
        <section className="bg-gradient-to-bl from-gray-900 via-gray-800 to-gray-900 text-white py-16">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h1 className="text-4xl font-bold mb-4">مدونة <span className="text-yellow-400">مير</span></h1>
            <p className="text-xl text-gray-300">نصائح ومقالات متخصصة في صيانة السيارات</p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map(post => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <a className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                    <div className="h-48 bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center text-6xl">
                      {post.image}
                    </div>
                    <div className="p-6">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">{post.category}</span>
                      <h2 className="text-lg font-bold text-gray-800 mt-3 mb-2 group-hover:text-yellow-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
