# Final Bootcamp Project: Toronto Neighbourhoods 

## INTRODUCTION

This project is examining data from the City of Toronto to identify key attributes of neighbourhoods/municipalities. The goal of the project is to assist families to make a decision on what will be the most ideal location for them to live/raise children based on these variables:
- School accessibility, type, and location
- Types of parks & recreation facilities
- Neighbourhood crime rates

### Considerations

#### Exploratory

- How are crime rates changing over the years in the neighbourhoods from 2019 to 2023?
- How many different types of schools are in the municipalities?
- What are the predicted crime rates for the neighbourhoods for next 2 years?

#### Mapping

- Which neighbourhoods are the best for families with young children to live based on these metrics?:
- Crime Rate
- School Type: Public vs Private
- Parks & Recreation - Amenities

## METHODOLOGY

### Goals 

- Conduct an exploratory analysis of the attributes above to gain a clear understanding of the layout of each municipality
- Create an overlay map / multiple maps of the Toronto neighbourhoods to show these 3 variables with dropdown menus that update the map based on the 3 factors
- Create visualizations of crime rate analysis on Tableau
- Use machine learning to predict the future crime rates in each neigbhourhood

### Flask App, HTML, JavaScript

Our data is saved on a MongoDB server. We used the Flask app to create multiple APIs to upload our data. We then created 5 endpoints (`index`, `charts`, `map`, `machinelearning`, `tableau`) for each part of our project. Each endpoint has its own HTML file which then uses our three JavaScript files (`logic`, `charts_logic`, `map_logic`) to populate the data for visualizations. 

### Machine Learning

We used a machine learning forecasting model to predict selected crime types' rates in the top 5 populated neighborhoods. The crime types we selected for this project are:
1. Assault
2. Autotheft
3. Homicide
4. Robbery

The model we used for this is Facebook Prophet (link to the documentation in the below resources section). This model was utilized to analyze the crime data from 2019 to 2023 to predict 2024 and 2025 rates. Then we created the visualization figures that we later used on our `machinelearning` endpoint. 

#### code snippet

The below is a code snippet in our machine learning model creation that implements the Prophet model:

```
# Create an empty dictionary to store the forecasts
neighborhood_forecasts = {}

# Define the selected crime types
selected_crime_types = ['Assault', 'Robbery', 'Homicide', 'Autotheft']

# Loop through each neighborhood
for neighborhood in top_neighborhoods:
    # Filter the data for the current neighborhood
    neighborhood_data = aggregated_crime_data[aggregated_crime_data['Name'] == neighborhood]

    # Create an empty DataFrame to store the forecasts for the current neighborhood
    neighborhood_forecasts[neighborhood] = pd.DataFrame()

    # Loop through each crime type
    for crime_type in selected_crime_types:
        # Filter the data for the current crime type
        crime_data_filtered = neighborhood_data[neighborhood_data['crime_type'] == crime_type]

        # Create a Prophet model
        model = Prophet()

        # Fit the model
        model.fit(crime_data_filtered)

        # Make future dataframe for the next two years
        future = model.make_future_dataframe(periods=2, freq='YS')  # 2 years

        # Forecast
        forecast = model.predict(future)

        # Add a column for the crime type
        forecast['CrimeType'] = crime_type

        # Concatenate the forecast to the DataFrame for the current neighborhood
        neighborhood_forecasts[neighborhood] = pd.concat([neighborhood_forecasts[neighborhood], forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'CrimeType']]], ignore_index=True)

# Display the forecasts for each neighborhood
for neighborhood, forecast_df in neighborhood_forecasts.items():
    print(f"Forecasts for {neighborhood}:")
    print(forecast_df)

```
### Tableau

Our crime data was once again used to create a different variation of visualizations on Tableau. We then used our `tableau` endpoint and HTML to link to Tableau Public workspace. 

## ANALYSIS

[PUT WHAT WE CAN LEARN FROM THE VISUALIZATION HERE]

## TEAM MEMBERS

- Amir Golshan
- Behnoosh Nasri
- Esi Akotia
- Hamza Malam
- Sharvil Koonjul 

## RESOURCES

- School locations - https://open.toronto.ca/dataset/school-locations-all-types/
- Parks & Recreation Facilities - https://open.toronto.ca/dataset/parks-and-recreation-facilities/
- Neighbourhood Crime Rates - https://open.toronto.ca/dataset/neighbourhood-crime-rates/
- Machine Learning Model: Facebook Prophet - https://facebook.github.io/prophet/ 

## USER GUIDE

- Install necessary packages: pymongo, flask, json, bson
- Open closed loop folder in VS Code or other IDEs
- Run the app.py file - ensure the index.html, the logic.js, and the style.css files are all in the respective folders
- Create a config.py file and enter your URL to access the MongoDB database (request permission from owner)
- Navigate the web page on your local host