export default function MetricsSection({ metrics }) {
    return (
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Health Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard 
              title="Sleep" 
              data={metrics.sleep} 
              format={v => `${v} hours`} 
            />
            <MetricCard 
              title="Exercise" 
              data={metrics.exercise} 
              format={v => `${v} minutes`} 
            />
            <MetricCard 
              title="Symptoms" 
              data={metrics.symptoms} 
              format={v => v.join(', ')} 
            />
            <MetricCard 
              title="Energy" 
              data={metrics.energy} 
              format={v => v} 
            />
          </div>
        </div>
  
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Insights</h2>
          <HealthInsights metrics={metrics} />
        </div>
      </div>
    )
  }
  
  function MetricCard({ title, data, format }) {
    const recentData = data.slice(-5)
    
    return (
      <div className="bg-gray-light p-4 rounded-md">
        <h3 className="font-medium mb-3">{title}</h3>
        {recentData.length === 0 ? (
          <p className="text-sm text-gray-medium">No data yet</p>
        ) : (
          <div className="space-y-2">
            {recentData.map((entry, i) => (
              <div key={i} className="text-sm">
                <span className="text-gray-medium">
                  {entry.date.toLocaleDateString()}: 
                </span>
                <span className="ml-2 text-gray-dark">
                  {format(entry.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  function HealthInsights({ metrics }) {
    const insights = generateInsights(metrics)
    
    return insights.length === 0 ? (
      <p className="text-gray-medium">Add more entries to receive personalized health insights.</p>
    ) : (
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="bg-gray-light p-4 rounded-md">
            <p className="text-gray-dark">{insight}</p>
          </div>
        ))}
      </div>
    )
  }
  
  function generateInsights(metrics) {
    const insights = []
    
    // Sleep patterns
    const recentSleep = metrics.sleep.slice(-7)
    if (recentSleep.length > 0) {
      const avgSleep = recentSleep.reduce((acc, curr) => acc + curr.value, 0) / recentSleep.length
      if (avgSleep < 7) {
        insights.push("Your average sleep has been below recommended levels. Consider adjusting your sleep schedule.")
      }
    }
  
    // Exercise patterns
    const recentExercise = metrics.exercise.slice(-7)
    if (recentExercise.length > 0) {
      const exerciseDays = recentExercise.length
      if (exerciseDays < 3) {
        insights.push("Try to increase your exercise frequency to at least 3 times per week.")
      }
    }
  
    // Symptom patterns
    const recentSymptoms = metrics.symptoms.slice(-7)
    if (recentSymptoms.length > 0) {
      const symptomCount = {}
      recentSymptoms.forEach(entry => {
        entry.value.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1
        })
      })
      
      Object.entries(symptomCount).forEach(([symptom, count]) => {
        if (count >= 3) {
          insights.push(`You've reported ${symptom} multiple times recently. Consider consulting a healthcare provider.`)
        }
      })
    }
  
    return insights
  }