import simple_legend
import dash
from dash import html
from dash.dependencies import Input, Output
import dash_html_components as html
import deckgl_ly as dgl
import plotly.express as px

colorscales = px.colors.sequential.Viridis
app = dash.Dash(__name__)

app.layout = html.Div([
    html.Div(className="tile is-ancestor", children=[
        html.Div(className="tile is-parent", children=[
            html.Div(className="tile is-child", children=[
                html.Button("Change Legend", id="change_button"),
            ]),
            html.Div(className="tile is-child is-dark", style={"zindex":0, "position":"relative", "height": "500px"}, children=[
                dgl.DeckglLy(id='network-map',
                    #mapboxtoken="took this out for privacy",
                    #mapStyle="took this out for privacy",
                    viewState = {
                        "longitude": -116,
                        "latitude": 34.65,
                        "zoom": 6,
                        "maxZoom": 20,
                        "pitch": 0,
                        "bearing": 0
                    },
                ),
            ]),
        ]),
    ]),

    simple_legend.SimpleLegend(
        id='color-legend',
        title=None,
        colors_dict = [{"label":'Thermal Generation', "color": [0,0,120]}, {"label":'Renewable Generation', "color":[51,160,44]},{"label":'Loss of Load', "color":[227,26,28]}],
        titleRectColor = "Gainsboro",
        legendTextColor = "black",
        legendRectColor = "snow",
        shape="rating",
        location={"right":10, "bottom":425},
    ),
    # simple_legend.SimpleLegend(
    #     id='legend',
    #     title="My Passed In Title",
    #     #colors_dict = [{"label":'redLabel', "color":"red"}, {"label":"blueLabel", "color":"blue"}, {"label":"greenLabel","color":"green"}],
    #     colors_dict = [{"label":'redLabel', "color":[255, 0, 0]}, {"label":"blueLabel", "color":[0,0,255]}, {"label":"greenLabel","color":[0, 255,0]}],
    #     titleRectColor ="Grey",
    #     titleTextColor = "Snow",
    #     legendTextColor =  "black",
    #     legendRectColor = "FloralWhite",
    #     shape="circle",
    #     #location={"right":500, "bottom":500},
    #     #orientation = "horizontal",
    # ),
    # simple_legend.SimpleLegend(
    #     id='legend-2',
    #     title=None,
    #     titleRectColor ="Grey",
    #     titleTextColor = "Snow",
    #     legendTextColor =  "black",
    #     legendRectColor = "FloralWhite",
    #     shape="line",
    #     location={"right":500, "bottom":500},
    #     #orientation = "horizontal",
    # ),


    html.Div(id='output')
])

@app.callback(Output('color-legend', 'colors_dict'),
              #Output('legend-2', 'colors_dict'),
              #Output('-legend', 'colors_dict'),
              Output('color-legend', 'title'),
              Output('color-legend', 'titleRectColor'),
               Output('color-legend', 'titleTextColor'),
              #Output('legend-2', 'title'),
              #Output('legend', 'title'),
              Input('change_button', 'n_clicks'),
              prevent_initial_call=True)
def display_output(n_clicks):

    colors_dict = None

    if(n_clicks%2 == 1):
        colors_dict = [{"label":'Maximal Wind Generation', "color":[31,120,180]}]
        title1 = None
        title2 = None
        title3 = None
    else:
        colors_dict = [{"label":'redLabel', "color":[90,90,90]}, {"label":"blueLabel", "color":[0,0,255]}, {"label":"greenLabel","color":[0, 255,0]}]
        title1 = "CHeck out m y new title"
        title2 = 'Line layer'
        title3 = "My New totle"

    line_dict = [{"label":'Line Saturation', "color":[255, 0, 0]}]

    return colors_dict, title1, "Snow", "Black"#line_dict, colors_dict, title1#, title2, title3


if __name__ == '__main__':
    app.run_server(debug=True)
