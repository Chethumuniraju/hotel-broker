from graphviz import Digraph

# Create Level 0 DFD
dot_level_0 = Digraph('Level 0 DFD')

# Define external entities
dot_level_0.node('User', 'User\n(External Entity)', shape='oval')
dot_level_0.node('Admin', 'Admin\n(External Entity)', shape='oval')

# Define processes
dot_level_0.node('Process1', 'Hotel Broker System\n(Process)', shape='square')

# Define data flows
dot_level_0.edge('User', 'Process1', label='Requests Hotel Information')
dot_level_0.edge('Process1', 'User', label='Displays Hotel Options')
dot_level_0.edge('Admin', 'Process1', label='Administer Hotels')

# Render Level 0 DFD
dot_level_0.render('level_0_hotel_broker_dfd', format='png', cleanup=True)
