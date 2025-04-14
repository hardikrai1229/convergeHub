import React from "react";

const features = [
  {
    title: "Real-time Chat",
    description: "Instant messaging with team members using a sleek, responsive UI.",
    image: "https://cdn.easyfrontend.com/pictures/blog/blog_2.jpg",
  },
  {
    title: "File Sharing",
    description: "Upload, download, and preview files directly in your workspace.",
    image: "https://cdn.easyfrontend.com/pictures/blog/blog_3.jpg",
  },
  {
    title: "Task Management",
    description: "Assign tasks, track progress, and meet deadlines efficiently.",
    image: "https://cdn.easyfrontend.com/pictures/blog/blog_4.jpg",
  },
  {
    title: "Collaborative Editor",
    description: "Edit documents together in real-time with seamless syncing.",
    image: "https://cdn.easyfrontend.com/pictures/blog/blog_5.jpg",
  },
];

const FeatureCards = () => {
  return (
    <section className="py-16 px-4 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">What You Can Do With ConvergeHub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105"
            >
              <img src={feature.image} alt={feature.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
